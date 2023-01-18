# Google Maps location

## Aim

The aim of this tool is to find some correlation between two Google Maps history data.

## Usage

Firstly, you have to get your Google Maps data directly from Google by going to https://takeout.google.com/ and select Maps history data (only this is necessary) for each two people.

Extract `Records.json` for each downloaded archive.

Specify your correlation parameters:

- `MAX_TIME_INTERVAL_IN_MINUTES`: time limit to detect correlation
- `MAX_DISTANCE_IN_METER`: distance limit to detect correlation

Then, you can execute `node index.js people1/Records.json people2/Records.json`

**Optional**

You can specify an API KEY of https://positionstack.com/ in `POSITION_STACK_API_KEY` and enable this with `ENABLE_GEO_REVERSE` if you want getting address correlation in addition of GPS coordinates.
