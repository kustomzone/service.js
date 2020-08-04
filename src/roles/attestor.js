const debug = require('debug')
const getChainAPI = require('../chainAPI')
const getServiceAPI = require('../serviceAPI')


/******************************************************************************
  ROLE: Attestor
******************************************************************************/
const ROLE = __filename.split('/').pop().split('.')[0].toLowerCase()

module.exports = role

async function role ({ name, account }) {
  const log = debug(`[${name.toLowerCase()}:${ROLE}]`)
  log('Register as attestor')
  const serviceAPI = getServiceAPI()
  const chainAPI = await getChainAPI()
  chainAPI.listenToEvents(handleEvent)

  await account.initAttestor()
  const attestorKey = account.attestor.publicKey
  const myAddress = account.chainKeypair.address
  const signer = account.chainKeypair
  const nonce = await account.getNonce()
  await chainAPI.registerAttestor({attestorKey, signer, nonce})

  // EVENTS
  async function handleEvent (event) {

    if (event.method === 'NewContract'){
      const [contractID] = event.data
      const contract = await chainAPI.getContractByID(contractID)
      const attestorID = contract.attestor
      const attestorAddress = await chainAPI.getUserAddress(attestorID)
      if (attestorAddress === myAddress) {
        log('Event received:', event.method, event.data.toString())
        const { feedKey, encoderKeys, hosterKeys } = await getContractData(contract)
        const foo = serviceAPI.verifyEncoding({account, hosterKeys, feedKey, encoderKeys})
        foo.then(async () => {
        })
      }
    }
    if (event.method === 'NewAttestation'){
      const [attestationID] = event.data
      const attestation = await chainAPI.getAttestationByID(attestationID)
      const attestorID = attestation.attestor
      const attestorAddress = await chainAPI.getUserAddress(attestorID)
      if (attestorAddress === myAddress) {
        log('Event received:', event.method, event.data.toString())
        const contractID = attestation.contract
        const contract = await chainAPI.getContractByID(contractID)
        const { feed: feedID } = await chainAPI.getPlanByID(contract.plan)
        const feedKey = await chainAPI.getFeedKey(feedID)
        const plan = await chainAPI.getPlanByID(contract.plan)
        const ranges = plan.ranges
        const randomChunks = ranges.map(range => getRandomInt(range[0], range[1] + 1))
        const data = { account, randomChunks, feedKey }
        const report = await serviceAPI.attest(data)
        const nonce = await account.getNonce()
        await chainAPI.submitAttestationReport({attestationID, report, signer, nonce})
      }
    }
    if (event.method === 'NewProofOfStorageChallenge') {
      const [challengeID] = event.data
      const challenge = await chainAPI.getChallengeByID(challengeID)
      const attestorID = challenge.attestor
      const attestorAddress = await chainAPI.getUserAddress(attestorID)
      if (attestorAddress === myAddress) {
        log('Event received:', event.method, event.data.toString())
        const data = await getChallengeData(challenge)
        data.account = account
        const hosterAddress = await chainAPI.getUserAddress(challenge.hoster)
        const { feedKey, challengeID, proofs} = await serviceAPI.verifyProofOfStorage(data)
        if (proofs) {
          const nonce = account.getNonce()
          const opts = {challengeID, proofs, signer, nonce}
          await chainAPI.submitProofOfStorage(opts)
        }
      }
    }
  }

  // HELPERS

  async function getChallengeData (challenge) {
    const hosterID = challenge.hoster
    const hosterKey = await chainAPI.getHosterKey(hosterID)
    const contract = await chainAPI.getContractByID(challenge.contract)
    const { feed: feedID } = await chainAPI.getPlanByID(contract.plan)
    const feedKey = await chainAPI.getFeedKey(feedID)
    return {hosterKey, feedKey, challengeID: challenge.id}
  }

  async function getContractData (contract) {
    // @TODO there's many encoders
    const encoders = contract.encoders
    const encoderKeys = []
    encoders.forEach(async (id) => {
      const key = await chainAPI.getEncoderKey(id)
      encoderKeys.push(key)
    })
    const hosters = contract.hosters
    const hosterKeys = []
    hosters.forEach(async (id) => {
      const key = await chainAPI.getHosterKey(id)
      hosterKeys.push(key)
    })
    const planID = contract.plan
    const { feed: feedID } = await chainAPI.getPlanByID(planID)
    const feedKey = await chainAPI.getFeedKey(feedID)
    return { feedKey, encoderKeys, hosterKeys }
  }

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
  }

}
