const { /*ApiPromise,*/ WsProvider, Keyring } = require('@polkadot/api')
const ApiPromise = require('./simulate-substrate')
const provider = {}
// const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api')
// const provider = new WsProvider('ws://127.0.0.1:9944')
const { randomAsU8a } = require('@polkadot/util-crypto') // make sure version matches api version
const { hexToBn, u8aToBuffer, bufferToU8a } = require('@polkadot/util')
const fs = require('fs')
const path = require('path')
const filename = path.join(__dirname, './types.json')
const types = JSON.parse(fs.readFileSync(filename).toString())
// const types = require('datdot-substrate/types.json')

module.exports = datdotChain

async function datdotChain () {
  const API = await rerun(() => ApiPromise.create({ provider, types }))
  const chainAPI = {
    newUser,
    registerHoster,
    registerEncoder,
    registerAttestor,
    publishFeedAndPlan,
    encodingDone,
    hostingStarts,
    requestProofOfStorageChallenge,
    submitProofOfStorage,
    requestAttestation,
    submitAttestationReport,
    listenToEvents,
    getFeedByID,
    getPlanByID,
    getContractByID,
    getChallengeByID,
    getAttestationByID,
    getFeedKey,
    getUserAddress,
    getHosterKey,
    getEncoderKey,
    getAttestorKey,
    getEncodedIndex,
  }

  return chainAPI

async function status ({ events = [], status }) {
  if (status.isInBlock) {
    events.forEach(({ phase, event: { data, method, section } }) => {
      LOG('\t', phase.toString(), `: ${section}.${method}`, data.toString())
    })
  }
}

async function makeNonce (nonce) {
  const NONCE = await API.createType('Index', nonce)
  return { nonce: NONCE }
 }
  async function newUser ({ signer, nonce }) {
    const tx = await API.tx.datVerify.newUser()
    // tx.signAndSend(signer, await makeNonce(nonce))
    tx.signAndSend(signer, await makeNonce(nonce), status)
  }
  async function registerHoster ({ hosterKey, signer, nonce }) {
    // hosterKey = bufferToU8a(hosterKey)
    const tx = await API.tx.datVerify.registerHoster(hosterKey)
    // tx.signAndSend(signer, await makeNonce(nonce))
    tx.signAndSend(signer, await makeNonce(nonce), status)
  }
  async function registerEncoder ({ encoderKey, signer, nonce }) {
    // encoderKey = bufferToU8a(encoderKey)
    const tx = await API.tx.datVerify.registerEncoder(encoderKey)
    // tx.signAndSend(signer, await makeNonce(nonce))
    tx.signAndSend(signer, await makeNonce(nonce), status)
  }
  async function registerAttestor ({ attestorKey, signer, nonce }) {
    // attestorKey = bufferToU8a(attestorKey)
    const tx = await API.tx.datVerify.registerAttestor(attestorKey)
    // tx.signAndSend(signer, await makeNonce(nonce))
    tx.signAndSend(signer, await makeNonce(nonce), status)
  }
  async function publishFeedAndPlan (opts) {
    const { merkleRoot, ranges, signer, nonce } = opts
    // merkleRoot[0] = bufferToU8a(merkleRoot[0])
    const tx = await API.tx.datVerify.publishFeedAndPlan(merkleRoot, ranges)
    // tx.signAndSend(signer, await makeNonce(nonce))
    tx.signAndSend(signer, await makeNonce(nonce), status)
  }
  async function getFeedKey (feedID) {
    // const feed = (await API.query.datVerify.getFeedByID(feedID)).unwrap()
    // return u8aToBuffer(feed.publickey.toU8a())
    const feed = (await API.query.datVerify.getFeedByID(feedID))
    return Buffer.from(feed.publickey, 'hex')
  }
  async function getUserAddress (id) {
    // const user = (await API.query.datVerify.getUserByID(id)).unwrap()
    // return user.address.toString()
    const user = await API.query.datVerify.getUserByID(id)
    return user.address
  }
  async function getHosterKey (id) {
    // const user = (await API.query.datVerify.getUserByID(id)).unwrap()
    // return u8aToBuffer(user.noise_key.toU8a().slice(1))
    const user = (await API.query.datVerify.getUserByID(id))
    return Buffer.from(user.hosterKey, 'hex')
  }
  async function getEncoderKey (id) {
    // const user = (await API.query.datVerify.getUserByID(id)).unwrap()
    // return u8aToBuffer(user.noise_key.toU8a().slice(1))
    const user = (await API.query.datVerify.getUserByID(id))
    return Buffer.from(user.encoderKey, 'hex')
  }
  async function getAttestorKey (id) {
    // const user = (await API.query.datVerify.getUserByID(id)).unwrap()
    // return u8aToBuffer(user.noise_key.toU8a().slice(1))
    const user = (await API.query.datVerify.getUserByID(id))
    return Buffer.from(user.attestorKey, 'hex')
  }
  async function getContractByID (id) {
    // return (await API.query.datVerify.getContractByID(id)).toJSON()
    return await API.query.datVerify.getContractByID(id)
  }
  async function getPlanByID (id) {
    // return (await API.query.datVerify.getPlanByID(id)).toJSON()
    return await API.query.datVerify.getPlanByID(id)
  }
  async function getFeedByID (id) {
    // const feedID = (await API.query.datVerify.getFeedByID(id)).toJSON()
    const feedID = (await API.query.datVerify.getFeedByID(id))
    return feedID
  }
  async function getChallengeByID (id) {
    // return (await API.query.datVerify.getChallengeByID(id)).toJSON()
    return await API.query.datVerify.getChallengeByID(id)
  }
  async function getAttestationByID (id) {
    // return (await API.query.datVerify.getAttestationByID(id)).toJSON()
    return await API.query.datVerify.getAttestationByID(id)
  }

  async function getEncodedIndex (encoderAddress) {
    const encoded = await HostedMap.encoded
    encoded.forEach((item, i) => { if (item[0] === encoderAddress) return i })
  }

  async function encodingDone (opts) {
    const {contractID, signer, nonce} = opts
    const tx = await API.tx.datVerify.encodingDone(contractID)
    // tx.signAndSend(signer, await makeNonce(nonce))
    tx.signAndSend(signer, await makeNonce(nonce), status)
  }
  async function hostingStarts (opts) {
    const {contractID, signer, nonce} = opts
    const tx = await API.tx.datVerify.hostingStarts(contractID)
    // tx.signAndSend(signer, await makeNonce(nonce))
    tx.signAndSend(signer, await makeNonce(nonce), status)
  }
  async function requestProofOfStorageChallenge (opts) {
    const {contractID, hosterID, signer, nonce} = opts
    const tx = await API.tx.datVerify.requestProofOfStorageChallenge(contractID, hosterID)
    // tx.signAndSend(signer, await makeNonce(nonce))
    tx.signAndSend(signer, await makeNonce(nonce), status)
  }
  async function submitProofOfStorage (opts) {
    const {challengeID, proofs, signer, nonce} = opts
    const tx = await API.tx.datVerify.submitProofOfStorage(challengeID, proofs)
    // tx.signAndSend(signer, await makeNonce(nonce))
    tx.signAndSend(signer, await makeNonce(nonce), status)
  }
  async function requestAttestation (opts) {
    const {contractID, signer, nonce} = opts
    const tx = await API.tx.datVerify.requestAttestation(contractID)
    // tx.signAndSend(signer, await makeNonce(nonce))
    tx.signAndSend(signer, await makeNonce(nonce), status)
  }
  async function submitAttestationReport (opts) {
    const {attestationID, report, signer, nonce} =  opts
    const tx = await API.tx.datVerify.submitAttestationReport(attestationID, report)
    // tx.signAndSend(signer, await makeNonce(nonce))
    tx.signAndSend(signer, await makeNonce(nonce), status)
  }
  // LISTEN TO EVENTS
  async function listenToEvents (handleEvent) {
    return API.query.system.events((events) => {
      events.forEach(async (record) => {
        // console.log(record.event.method, record.event.data.toString())
        const event = record.event
        handleEvent(event)
      })
    })
  }
  function rerun (promiseFn, maxTries = 20, delay = 100) {
    let counter = 0
    while (true) {
      // Try to execute the promise function and return the result
      try { return promiseFn() }
      // If we get an error maxTries time, we finally error
      catch (error) { if (counter >= maxTries) throw error }
      // Otherwise we increase the counter and keep looping
      counter++
    }
  }
}
