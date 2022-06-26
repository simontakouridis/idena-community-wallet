import { call } from 'redux-saga/effects';
import {
  CallContractAttachment,
  ContractArgumentFormat,
  DeployContractAttachment,
  EmbeddedContractType,
  calculateGasCost,
  IdenaProvider,
  TransactionType
} from 'idena-sdk-js';
import { appConfigurations } from './constants';

const provider = IdenaProvider.create(appConfigurations.idenaRestrictedNodeUrl, appConfigurations.idenaRestrictedNodeKey);

const sendTx = (tx, callbackUrl) => {
  const params = new URLSearchParams({
    tx: tx.toHex(),
    callback_format: 'html',
    callback_url: encodeURIComponent(callbackUrl)
  });

  window.location.href = `${appConfigurations.idenaRawTxUrl}?` + params.toString();
};

export function* getFeePerGas() {
  return yield call([provider, provider.Blockchain.feePerGas]);
}

export function* deploy(m, n, amount, sender) {
  const deployAttachment = new DeployContractAttachment({
    codeHash: EmbeddedContractType.MultisigContract
  });

  const args = [
    { format: ContractArgumentFormat.Byte, index: 0, value: n },
    { format: ContractArgumentFormat.Byte, index: 1, value: m }
  ];

  deployAttachment.setArgs(args);

  // build deploy tx through node (epoch, nonce will by filled automatically by node)
  const tx = yield call([provider, provider.Blockchain.buildTx], {
    from: sender,
    type: TransactionType.DeployContractTx,
    amount,
    payload: deployAttachment.toBytes()
  });

  const feePerGas = yield call(getFeePerGas);
  const deployGas = 1300;

  // calculate total TX cost
  tx.maxFee = calculateGasCost(feePerGas, tx.gas + deployGas);

  // construct callback url
  const callbackUrl = `${appConfigurations.localBaseUrl}/create-wallet/creating`;

  sendTx(tx, callbackUrl);
}

export function* add(contract, address, sender) {
  const callAttachment = new CallContractAttachment({
    method: 'add'
  });

  callAttachment.setArgs([
    {
      format: ContractArgumentFormat.Hex,
      index: 0,
      value: address
    }
  ]);

  const tx = yield call([provider, provider.Blockchain.buildTx], {
    from: sender,
    type: TransactionType.CallContractTx,
    to: contract,
    payload: callAttachment.toBytes()
  });

  const feePerGas = yield call(getFeePerGas);
  const addGas = 2000;

  // calculate total TX cost
  tx.maxFee = calculateGasCost(feePerGas, tx.gas + addGas);

  // construct callback url
  const callbackUrl = `${appConfigurations.localBaseUrl}/create-wallet/adding`;

  sendTx(tx, callbackUrl);
}

export function* send(contract, destination, amount, sender, walletId) {
  const callAttachment = new CallContractAttachment({
    method: 'send'
  });

  callAttachment.setArgs([
    {
      format: ContractArgumentFormat.Hex,
      index: 0,
      value: destination
    },
    {
      format: ContractArgumentFormat.Dna,
      index: 1,
      value: amount
    }
  ]);

  const tx = yield call([provider, provider.Blockchain.buildTx], {
    from: sender,
    type: TransactionType.CallContractTx,
    to: contract,
    payload: callAttachment.toBytes()
  });

  const feePerGas = yield call(getFeePerGas);
  const sendGas = 2000;

  // calculate total TX cost
  tx.maxFee = calculateGasCost(feePerGas, tx.gas + sendGas);

  // construct callback url
  const callbackUrl = `${appConfigurations.localBaseUrl}/wallet/${walletId}/create-transaction/signing`;

  sendTx(tx, callbackUrl);
}

export function* push(contract, destination, amount, sender, walletId) {
  const callAttachment = new CallContractAttachment({
    method: 'push'
  });

  callAttachment.setArgs([
    {
      format: ContractArgumentFormat.Hex,
      index: 0,
      value: destination
    },
    {
      format: ContractArgumentFormat.Dna,
      index: 1,
      value: amount
    }
  ]);

  const tx = yield call([provider, provider.Blockchain.buildTx], {
    from: sender,
    type: TransactionType.CallContractTx,
    to: contract,
    payload: callAttachment.toBytes()
  });

  const feePerGas = yield call(getFeePerGas);
  const pushGas = 2500;

  // calculate total TX cost
  tx.maxFee = calculateGasCost(feePerGas, tx.gas + pushGas);

  // construct callback url
  const callbackUrl = `${appConfigurations.localBaseUrl}/wallet/${walletId}/create-transaction/executing`;

  sendTx(tx, callbackUrl);
}

export function* terminate(contract, author, sender) {
  const callAttachment = new CallContractAttachment({
    method: 'terminate'
  });

  callAttachment.setArgs([
    {
      format: ContractArgumentFormat.Hex,
      index: 0,
      value: author
    }
  ]);

  const tx = yield call([provider, provider.Blockchain.buildTx], {
    from: sender,
    type: TransactionType.CallContractTx,
    to: contract,
    payload: callAttachment.toBytes()
  });

  const feePerGas = yield call(getFeePerGas);
  const terminateGas = 2500;

  // calculate total TX cost
  tx.maxFee = calculateGasCost(feePerGas, tx.gas + terminateGas);

  // construct callback url
  const callbackUrl = `${appConfigurations.localBaseUrl}/create-wallet`;

  sendTx(tx, callbackUrl);
}
