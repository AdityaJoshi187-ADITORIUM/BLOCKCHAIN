"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = __importStar(require("crypto"));
// transaction class
class Transaction {
    constructor(amount, payer, payee) {
        this.amount = amount;
        this.payer = payer;
        this.payee = payee;
    }
    // serialise transaction as a string
    toString() {
        return JSON.stringify(this);
    }
}
// block class
class Block {
    constructor(prevHash, transaction, ts = Date.now()) {
        this.prevHash = prevHash;
        this.transaction = transaction;
        this.ts = ts;
        // number only used once, used as the solution for mining
        this.numOnlyUsedOnce = Math.round(Math.random() * 999999999);
    }
    // getter method to return a hash of this block
    get hash() {
        const str = JSON.stringify(this);
        const hash = crypto.createHash('SHA256');
        hash.update(str).end();
        return hash.digest('hex');
    }
}
// chain class
class Chain {
    // create genesis block
    constructor() {
        this.chain = [new Block('', new Transaction(100, 'genesis', 'godwin'))];
    }
    // return the last block in the chain
    get lastBlock() {
        return this.chain[this.chain.length - 1];
    }
    // mine a block to confirm it as a transaction on the blockchain
    mine(numOnlyUsedOnce) {
        let solution = 1;
        console.log('👻 Mining transactions...');
        // keep looping until solution is found
        while (true) {
            const hash = crypto.createHash('MD5');
            hash.update((numOnlyUsedOnce + solution).toString()).end();
            const attempt = hash.digest('hex');
            // add more 0's to make it harder
            if (attempt.substr(0, 4) === '0000') {
                console.log(`Solved transaction with solution: ${solution}. Block is confirmed!\n`);
                return solution;
            }
            solution += 1;
        }
    }
    // add a block to the blockchain
    addBlock(transaction, senderPublicKey, signature) {
        console.log("👻 Sending GHOSTCoin...");
        // verify a transaction before adding it
        const verifier = crypto.createVerify('SHA256');
        verifier.update(transaction.toString());
        const isValid = verifier.verify(senderPublicKey, signature);
        // if it is valid, create a block, mine it and add it to the blockchain
        if (isValid) {
            console.log("👻 Transaction is valid!");
            const newBlock = new Block(this.lastBlock.hash, transaction);
            this.mine(newBlock.numOnlyUsedOnce);
            this.chain.push(newBlock);
        }
    }
}
// singleton instance as we only want 1 chain
Chain.instance = new Chain();
// wallet class
class Wallet {
    // generate key pair when a new wallet is created
    constructor() {
        const keypair = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });
        this.privateKey = keypair.privateKey;
        this.publicKey = keypair.publicKey;
    }
    // send money from users wallet to another
    sendMoney(amount, payeePublicKey) {
        const transaction = new Transaction(amount, this.publicKey, payeePublicKey);
        const sign = crypto.createSign('SHA256');
        sign.update(transaction.toString()).end();
        const signature = sign.sign(this.privateKey);
        Chain.instance.addBlock(transaction, this.publicKey, signature);
    }
}
const aditya = new Wallet();
const elon = new Wallet();
const trump = new Wallet();
aditya.sendMoney(50, trump.publicKey);
elon.sendMoney(23, aditya.publicKey);
trump.sendMoney(5, elon.publicKey);
console.log(Chain.instance);
