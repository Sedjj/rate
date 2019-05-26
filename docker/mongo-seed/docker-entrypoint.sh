#!/bin/bash
set -e

if [ "$1" = 'mongoDB' ]; then
	echo 'Restore from dump'
	mongoimport --host mongo-rate --type json --collection footballs --mode merge --db rateBot --file data/dump/footballs.json
	mongoimport --host mongo-rate --type json --collection tabletennis --mode merge --db rateBot --file data/dump/tabletennis.json

	echo 'Restore from scripts'
	mongo 127.0.0.1:27017/rateBot data/scripts/index.js
fi