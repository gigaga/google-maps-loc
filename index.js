const haversine = require("haversine-distance");
const fs = require("fs");
const fetch = require("sync-fetch");
const json = require("big-json");

const file1 = "/media/sf_D_DRIVE/Records.json";
const file2 = "/media/sf_D_DRIVE/test2.txt";

const MAX_TIME_INTERVAL_IN_MINUTES = 60;
const MAX_DISTANCE_IN_METER = 1000;
const ENABLE_GEO_REVERSE = false;

const POSITION_STACK_API_KEY = "";

console.log("Analyzing...");
const read1Stream = fs.createReadStream(file1);
const parse1Stream = json.createParseStream();

const promise1 = new Promise((resolve, reject) => {
  parse1Stream.on("data", function (pojo) {
    resolve(pojo);
  });
});
read1Stream.pipe(parse1Stream);

const read2Stream = fs.createReadStream(file2);
const parse2Stream = json.createParseStream();

const promise2 = new Promise((resolve, reject) => {
  parse2Stream.on("data", function (pojo) {
    resolve(pojo);
  });
});
read2Stream.pipe(parse2Stream);

Promise.all([promise1, promise2]).then(([obj1, obj2]) => {
  obj1.locations.forEach((obj1Location) => {
    const obj1Lat = obj1Location.latitudeE7 / 10000000;
    const obj1Lng = obj1Location.longitudeE7 / 10000000;
    const obj1Timestamp = Date.parse(obj1Location.timestamp);

    const locationsTimeMatches = obj2.locations.filter((location) => {
      return (
        obj1Timestamp - (MAX_TIME_INTERVAL_IN_MINUTES / 2) * 60 * 1000 <=
          Date.parse(location.timestamp) &&
        obj1Timestamp + (MAX_TIME_INTERVAL_IN_MINUTES / 2) * 60 * 1000 >=
          Date.parse(location.timestamp)
      );
    });

    if (locationsTimeMatches.length > 0) {
      const sortLocationsTimeMatches = locationsTimeMatches.sort(
        (loc1, loc2) => {
          const loc1Lat = loc1.latitudeE7 / 10000000;
          const loc1Lng = loc1.longitudeE7 / 10000000;

          const loc2Lat = loc2.latitudeE7 / 10000000;
          const loc2Lng = loc2.longitudeE7 / 10000000;

          const distance1 = haversine(
            { lat: obj1Lat, lng: obj1Lng },
            { lat: loc1Lat, lng: loc1Lng }
          );

          const distance2 = haversine(
            { lat: obj1Lat, lng: obj1Lng },
            { lat: loc2Lat, lng: loc2Lng }
          );

          return distance1 < distance2 ? -1 : distance1 > distance2 ? 1 : 0;
        }
      );
      const obj2Location = sortLocationsTimeMatches[0];

      const lat = obj2Location.latitudeE7 / 10000000;
      const lng = obj2Location.longitudeE7 / 10000000;
      const timestamp = Date.parse(obj2Location.timestamp);

      const distance = haversine({ lat: obj1Lat, lng: obj1Lng }, { lat, lng });
      if (distance <= MAX_DISTANCE_IN_METER) {
        let address;
        const timeInterval = Math.abs(timestamp - obj1Timestamp) / 1000 / 60;
        if (ENABLE_GEO_REVERSE) {
          const data = fetch(
            `http://api.positionstack.com/v1/reverse?access_key=${POSITION_STACK_API_KEY}&query=${obj1Lat},${obj1Lng}`,
            {
              headers: {
                Accept: "application/json",
              },
            }
          ).json();
          if (data.data.length > 0) {
            address = `${data.data[0].name} ${data.data[0].postal_code} ${data.data[0].locality}`;
          }
        }

        console.log(
          `On ${new Date(
            obj1Location.timestamp
          ).toLocaleString()}, at ${Math.round(
            timeInterval
          )} minutes and ${Math.round(distance)} meters ${
            address ? `at ${address} (${lat}, ${lng})` : `(${lat}, ${lng})`
          }`
        );
      }
    }
  });
});
