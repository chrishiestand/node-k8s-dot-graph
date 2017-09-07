# node-k8s-dot-graph
[![NPM](https://nodei.co/npm/k8s-dot-graph.png)](https://nodei.co/npm/k8s-dot-graph/)

node.js library to create a dot graph (e.g. graphviz) from kubernetes objects. This lets you create a graph visualization of your kubernetes cluster.

Inputs are the kubernetes object lists from the k8s api endpoints for NodeList, PodList, ServiceList, and IngressList and output is a string in dot format representing the kubernetes cluster.

If you want to just generate a .dot or .svg using `kubectl` check out <https://github.com/chrishiestand/k8s-network-graph> instead.

## Example Code

```javascript
import kdg from 'k8s-dot-graph'

async function main() {
  const nodeList    = await getNodeList()
  const podList     = await getPodList()
  const ingressList = await getIngressList()
  const serviceList = await getServiceList()

  const dotGraphString = kdg.makeDotGraph({nodeList, serviceList, podList, ingressList})
}

```

## Options

`makeDotGraph()` accepts the following dot format options with defaults shown:

```javascript

kdg.makeDotGraph({
  nodeList,
  serviceList,
  podList,
  ingressList,
  splines      : 'ortho',
  sep          : '6.2',
  ranksep      : '2.0 equally',
  internetShape: 'circle',
})
```

## Installation
`npm install k8s-dot-graph`

## Example Output

This is an example of a small 2-node, 3-pod cluster. These get much larger.

```dot
digraph {
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
```

### Example Visualized
![Example output](https://github.com/chrishiestand/node-k8s-dot-graph/raw/master/test/screenshot.png)

## Contributions

Issues/PRs are welcome.

### Possible TODO Items

* Simplify/expand dot file options
* Add version support for kubernetes API (currently tested against 1.6)
* Add support for additional kubernetes objects?
