import fs from 'fs'
import path from 'path'

import test from 'ava'

import kdg from '../src/index'

test('makeDotGraph empty', t => {

  const dotGraph = kdg.makeDotGraph({})
  t.is(dotGraph, emptyDotGraphString)
});

test('makeDotGraph test', t => {

  const nodeList    = getKubeItems('fixtures/nodelist.json')
  const ingressList = getKubeItems('fixtures/ingresslist.json')
  const serviceList = getKubeItems('fixtures/servicelist.json')
  const podList     = getKubeItems('fixtures/podlist.json')

  const dotGraph = kdg.makeDotGraph({nodeList, serviceList, podList, ingressList})

  t.is(dotGraph, testDotGraph)
});

function getKubeItems(relPath) {
  const listPath   = path.join(__dirname, relPath)
  const listString = fs.readFileSync(listPath, {encoding: 'utf8'})
  const listObj    = JSON.parse(listString)
  return listObj.items
}

const emptyDotGraphString = `digraph {
sep=6.2;
ranksep="2.0 equally";
splines="ortho";
"internet" [label="internet"][shape=circle];}\n`

const testDotGraph=`digraph {
sep=6.2;
ranksep="2.0 equally";
splines="ortho";
"svcs:app1" [label="service: app1"][shape=diamond];
"svcs:auth" [label="service: auth"][shape=diamond];
"svcs:redis-master" [label="service: redis-master"][shape=diamond];
"pods:app1-3746604072-3jfn8" [label="app1-3746604072-3jfn8"][shape=oval];
"pods:auth-1124301931-8h7fp" [label="auth-1124301931-8h7fp"][shape=oval];
"pods:redis-master-853269215-glqjs" [label="redis-master-853269215-glqjs"][shape=oval];
"ings:svc" [label="ingress: svc"][shape=invtriangle];
"internet" [label="internet"][shape=circle];subgraph "cluster-gke-testcluster-pool-3-0aa49f08-p92k" { label="node: gke-testcluster-pool-3-0aa49f08-p92k";
"pods:auth-1124301931-8h7fp";
"pods:redis-master-853269215-glqjs";
}

subgraph "cluster-gke-testcluster-pool-3-cc049887-zsmc" { label="node: gke-testcluster-pool-3-cc049887-zsmc";
"pods:app1-3746604072-3jfn8";
}
"internet" -> "ings:svc";
"internet" -> "svcs:app1";
"ings:svc" -> "svcs:auth";
"svcs:app1" -> "pods:app1-3746604072-3jfn8";
"svcs:auth" -> "pods:auth-1124301931-8h7fp";
"svcs:redis-master" -> "pods:redis-master-853269215-glqjs";
}
`
