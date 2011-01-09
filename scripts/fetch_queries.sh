#!/bin/sh

export DATA_SERVER=http://localhost:5000
export WGET=wget

export QUERY1=api/rest/key/es_cofog1
export QUERY2=api/rest/key/es_cofog2
export QUERY3=api/rest/key/es_cofog3
export QUERY4=api/rest/key/region
export QUERY5="api/aggregate?slice=spain&exclude-spender=yes&breakdown-es_cofog1=yes&breakdown-es_cofog2=yes&breakdown-es_cofog3=yes"

mkdir -p api/rest/key

$WGET -O$QUERY1 $DATA_SERVER/$QUERY1
$WGET -O$QUERY2 $DATA_SERVER/$QUERY2
$WGET -O$QUERY3 $DATA_SERVER/$QUERY3
$WGET -O$QUERY4 $DATA_SERVER/$QUERY4
$WGET -O$QUERY5 $DATA_SERVER/$QUERY5