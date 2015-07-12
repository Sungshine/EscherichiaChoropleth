__author__ = 'sungshine'
__date__ = 'July 9, 2015'
#!/usr/bin/env python
import csv

# script for CS4460 to transform FIPs county/state codes into GEOIDs for use in d3.js visualization
stateFIPS = {}
grandHash = {}

with open('countyFIPS_v2.csv', 'rU') as f, open('EC_data2014.csv', 'rU') as d:

    data = csv.reader(f, delimiter = ',')
    ecoliData = csv.reader(d, delimiter = ',')

    for row in data:
        if not (row[0] in stateFIPS.keys()):
            stateFIPS[row[0]] = row[1]
        else:
            pass

        grandHash.setdefault(row[0], {})[row[3]] = row[2]

    with open('newfile.csv', 'wb') as newcsv:
        writer = csv.writer(newcsv, delimiter = ',')
        writer.writerow(
                        [
                         'Key',
                         'SourceState',
                         'StateFIPS',
                         'Serotype',
                         'PFGE-XbaI-pattern',
                         'PFGE-BlnI-pattern',
                         'Outbreak',
                         'SourceCounty',
                         'CountyFIPS',
                         'SourceCity',
                         'SourceType',
                         'SourceSite',
                         'PatientAge',
                         'PatientSex',
                         'UploadDate',
                         'Toxin',
                         'VirulenceMarker',
                         'GEOID',
                        ]
                       )

        for entry in ecoliData:
            id = entry[0]
            state  = entry[1]
            county = entry[7]
            if (state in grandHash.keys()) and (county in grandHash[state].keys()):
                writer.writerow(
                                [
                                 id,
                                 state,
                                 stateFIPS.get(state),
                                 entry[3],
                                 entry[4],
                                 entry[5],
                                 entry[6],
                                 county,
                                 grandHash[state].get(county),
                                 entry[9],
                                 entry[10],
                                 entry[11],
                                 entry[12],
                                 entry[13],
                                 entry[14],
                                 entry[15],
                                 entry[16],
                                 stateFIPS.get(state)+grandHash[state].get(county),
                                ]
                               )
