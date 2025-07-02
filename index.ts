import * as crypto from 'crypto'

// transaction class
class Transaction {

    constructor(
        public amount: number,
        public payer: string,
        public payee: string
    ) {}

    // serialise transaction as a string
    toString() {
        return JSON.stringify(this);
    }
}

// block class
class Block {

    // number only used once, used as the solution for mining
    public numOnlyUsedOnce = Math.round(Math.random() * 999999999);

    constructor(
        public prevHash: string,
        public transaction: Transaction,
        public ts = Date.now()
    ) {}

    // getter method to return a hash of this block
    get hash() {
        const str = JSON.stringify(this);
        const hash = crypto.createHash('SHA256');
        hash.update(str).end();
        return hash.digest('hex')
    }
}

// chain class
class Chain {

    // singleton instance as we only want 1 chain
    public static instance = new Chain();

    // the chain is a series of linked blocks
    chain: Block[];

    // create genesis block
    constructor() {
        this.chain = [new Block('', new Transaction(100, 'genesis', 'godwin'))];
    }

    // return the last block in the chain
    get lastBlock() {
        return this.chain[this.chain.length - 1];
    }

    // mine a block to confirm it as a transaction on the blockchain
    mine(numOnlyUsedOnce: number) {
        let solution = 1;
        console.log('👻 Mining transactions...')

        // keep looping until solution is found
        while(true) {
            const hash = crypto.createHash('MD5');
            hash.update((numOnlyUsedOnce + solution).toString()).end();

            const attempt = hash.digest('hex')

            // add more 0's to make it harder
            if (attempt.substr(0, 4) === '0000'){
                console.log(`Solved transaction with solution: ${solution}. Block is confirmed!\n`);
                return solution
            }

            solution += 1
        }
    }

    // add a block to the blockchain
    addBlock(transaction: Transaction, senderPublicKey: string, signature: Buffer) {

        console.log("👻 Sending GHOSTCoin...")

        // verify a transaction before adding it
        const verifier = crypto.createVerify('SHA256');
        verifier.update(transaction.toString());

        const isValid = verifier.verify(senderPublicKey, signature);

        // if it is valid, create a block, mine it and add it to the blockchain
        if (isValid) {
            console.log("👻 Transaction is valid!")
            const newBlock = new Block(this.lastBlock.hash, transaction);
            this.mine(newBlock.numOnlyUsedOnce);
            this.chain.push(newBlock);
        }
    }
}

// wallet class
class Wallet {

    public publicKey: string;
    public privateKey: string;

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
    sendMoney(amount: number, payeePublicKey: string) {
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

console.log(Chain.instance)