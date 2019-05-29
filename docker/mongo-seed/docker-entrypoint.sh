#!/bin/sh
set -e

if [ "$1" = 'mongoDB' ]; then
	echo 'Restore from dump'
	mongoimport --host mongo-rate --type json --collection footballs --mode merge --db rateBot --file data/dump/footballs.json
	mongoimport --host mongo-rate --type json --collection tabletennis --mode merge --db rateBot --file data/dump/tabletennis.json

	echo 'Restore from scripts'
	mongo rateBot --shell data/scripts/index.js --host mongo-rate --port 27017
fi