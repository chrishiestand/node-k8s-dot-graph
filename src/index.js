const ramda=require('ramda')

const kdg = {}

kdg.makeDotGraph = function makeDotGraph({nodes = [], svcs = [], pods = [], ings = [], splines='ortho', sep='6.2', ranksep='2.0 equally', internetShape = 'star'}) {

  const minionObjs = kdg.makeObjsDotStandard(nodes, 'nodes')
  const svcObjs = kdg.makeObjsDotStandard(svcs, 'svcs')
  const podObjs = kdg.makeObjsDotStandard(pods, 'pods')
  const ingObjs = kdg.makeObjsDotStandard(ings, 'ings')

  let dotGraphString = 'digraph {\n'
  dotGraphString += `sep=${sep};\n`
  dotGraphString += `ranksep="${ranksep}";\n`
  dotGraphString += `splines="${splines}";\n`

  const internetObj = kdg.makeInternetNodeObj(internetShape)

  const graphNodeObjs = svcObjs.concat(podObjs, ingObjs, [internetObj])
  const nodeStrings = graphNodeObjs.map((nodeObj) => kdg.dotNode(nodeObj))

  dotGraphString += nodeStrings.join('\n')

  const subgraphs = minionObjs.map((minion) => kdg.dotMinionSubGraphString(minion, podObjs))

  dotGraphString += subgraphs.join('\n')

  const internetToIngresses = ingObjs.map((ing) => kdg.dotEdgeInternetIngress(internetObj, ing))
  dotGraphString += internetToIngresses.join('\n')

  dotGraphString += kdg.dotEdgeInternetServices(internetObj, svcObjs)
  dotGraphString += kdg.dotEdgeIngressServices(ingObjs, svcObjs)
  dotGraphString += kdg.dotEdgeServicesPods(svcObjs, podObjs)

  dotGraphString += '}\n'

  return dotGraphString
}

kdg.makeObjsDotStandard = function makeObjsDotStandard(fullKubeObjects, typePlural) {
  return fullKubeObjects.map((obj) => kdg.makeGraphNodeObj(obj, typePlural))
}

kdg.makeUniqueId = function makeUniqueId(name, type) {
  return `${type}:${name}`
}

kdg.dotEdgeServicesPods = function dotEdgeServicesPods(svcs, pods) {

  let string = ''

  svcs.map((svc) => {
    const selector = svc.spec.selector

    if (!selector) {
      return
    }

    pods.map((pod) => {
      if (!kdg.svcPodMatch(selector, pod.labels)) {
        return
      }
      string += `"${svc.id}" -> "${pod.id}";\n`
    })
  })

  return string
}

kdg.svcPodMatch = function svcPodMatch(svcSelector, podLabels) {
  return kdg.objIsSubset(podLabels, svcSelector)
}

kdg.dotNode = function dotNode(node) {
  let string = `"${node.id}" [label="${node.label}"]`

  if (node.shape) {
    string += `[shape=${node.shape}]`
  }

  return `${string};`
}

kdg.dotEdgeInternetIngress = function dotEdgeInternetIngress(internetObj, ingress) {
  return `"${internetObj.id}" -> "${ingress.id}";\n`
}

kdg.dotEdgeIngressServices = function dotEdgeIngressServices(ingresses, services) {

  let string = ''

  ingresses.map((ing) => {
    const ingPaths = ing.spec.rules[0].http.paths //TODO fix [0] kludge
    const ingSvcs = ingPaths.map((path) => path.backend.serviceName)

    services.map((svc) => {
      if (ingSvcs.includes(svc.name)) {
        string += `"${ing.id}" -> "${svc.id}";\n`
      }
    })

  })

  return string
}

kdg.dotEdgeInternetServices = function dotEdgeInternetServices(internetObj, services) {
  const publicServices = ramda.filter((service) => service.spec.type === 'LoadBalancer', services)

  const strings = publicServices.map((svc) => `"${internetObj.id}" -> "${svc.id}";\n`)

  return strings.join('')
}

kdg.dotMinionSubGraphString = function dotMinionSubGraphString(minion, pods) {

  let minionPods = ramda.filter((pod) => minion.name === pod.nodeName, pods)

  let string = `subgraph "cluster-${minion.name}" { `
  string += `label="node: ${minion.name}";\n`

  minionPods.map((pod) => {
    string += `"${pod.id}";\n`
  })

  string += '}\n'

  return string
}

kdg.makeGraphNodeObj = function makeGraphNodeObj(kubeObj, type, podShape = 'oval', svcShape = 'diamond', ingressShape = 'invtriangle') {

  const pruned = {
    name  : kubeObj.metadata.name,
    labels: kubeObj.metadata.labels,
    spec  : kubeObj.spec,
    type,
  }

  if (type === 'pods') {
    pruned.generateName = kubeObj.metadata.generateName
    pruned.nodeName     = kubeObj.spec.nodeName
    pruned.shape = podShape
    pruned.label = pruned.name
  }
  else if (type === 'ings') {
    pruned.shape = ingressShape
    pruned.label = 'ingress: ' + pruned.name
  }
  else if (type === 'svcs') {
    pruned.shape = svcShape
    pruned.label = 'service: ' + pruned.name
  }

  pruned.id = kdg.makeUniqueId(pruned.name, type)

  return pruned
}

kdg.makeInternetNodeObj = function makeInternetNodeObj(shape = 'star') {

  return {
    name: 'internet',
    label: 'internet',
    id: 'internet',
    shape,
  }
}

kdg.objIsSubset = function objIsSubset(superset, subset) {
  const subsetKeys = Object.keys(subset)
  return ramda.equals(ramda.props(subsetKeys, superset), ramda.props(subsetKeys, subset))
}

module.exports = kdg
