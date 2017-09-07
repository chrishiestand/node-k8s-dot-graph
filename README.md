# node-k8s-dot-graph

node.js library to create a dot graph (e.g. graphviz) from kubernetes objects. This lets you create a graph visualization of your kubernetes cluster.

Inputs are the kubernetes object lists from the k8s api endpoints for NodeList, PodList, ServiceList, and IngressList and output is a string in dot format representing the kubernetes cluster.

## Example

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
