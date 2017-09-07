# node-k8s-dot-graph

node.js library to create a dot graph (e.g. graphviz) from kubernetes objects. This lets you create a graph visualization of your kubernetes cluster.

Inputs are the kubernetes object lists from the k8s api endpoints for NodeList, PodList, ServiceList, and IngressList and output is a string in dot format representing the kubernetes cluster.

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

## Example Output

This is an example of a small 2-node, 3-pod cluster. These get much larger.
![Example output](https://github.com/chrishiestand/node-k8s-dot-graph/raw/master/test/screenshot.png)

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
  internetShape: 'star',
})

```
## Contributions

Issues/PRs are welcome.
