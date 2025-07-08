import type { HttpRequest, HttpResponse } from 'appwrite'
import * as bip39 from 'bip39'
import * as bitcoin from 'bitcoinjs-lib'
import { ethers } from 'ethers'
import crypto from 'crypto'

type CreateWalletInput = {
  walletType: 'hot' | 'cold' | 'hardware' | 'imported'
  blockchain: 'bitcoin' | 'ethereum' | 'polygon' | 'bsc'
  mnemonic?: string
  walletPassword: string
  walletName: string
  derivationPath?: string
}

type WalletResult = {
  walletAddress: string
  publicKey: string
  encryptedPrivateKey: string
  derivationPath?: string
  mnemonic?: string // Only return if requested (never store)
}

// AES-256-GCM encryption using password-based key derivation
function encrypt(data: string, password: string): string {
  const salt = crypto.randomBytes(16)
  const iv = crypto.randomBytes(12)
  const key = crypto.scryptSync(password, salt, 32)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  // Return base64(salt).base64(iv).base64(tag).base64(encrypted), joined by '.'
  return [
    salt.toString('base64'),
    iv.toString('base64'),
    tag.toString('base64'),
    encrypted.toString('base64')
  ].join('.')
}

export default async function handler(req: HttpRequest, res: HttpResponse) {
  try {
    const {
      walletType,
      blockchain,
      mnemonic,
      walletPassword,
      walletName,
      derivationPath
    } = req.json() as CreateWalletInput

    if (!walletType || !blockchain || !walletPassword || !walletName) {
      return res.json({ error: 'Missing required fields' }, 400)
    }

    let result: WalletResult

    if (blockchain === 'bitcoin') {
      // Bitcoin wallet
      let seed: Buffer
      let usedMnemonic = mnemonic
      if (!mnemonic) {
        usedMnemonic = bip39.generateMnemonic()
      }
      seed = await bip39.mnemonicToSeed(usedMnemonic!)
      const path = derivationPath || "m/84'/0'/0'/0/0"
      const root = bitcoin.bip32.fromSeed(seed)
      const child = root.derivePath(path)
      const { address } = bitcoin.payments.p2wpkh({ pubkey: child.publicKey })
      result = {
        walletAddress: address!,
        publicKey: child.publicKey.toString('hex'),
        encryptedPrivateKey: encrypt(child.toWIF(), walletPassword),
        derivationPath: path,
        mnemonic: walletType === 'imported' ? usedMnemonic : undefined
      }
    } else {
      // Ethereum-like wallet
      let usedMnemonic = mnemonic
      let wallet: ethers.Wallet
      let path = derivationPath || "m/44'/60'/0'/0/0"
      if (!mnemonic) {
        usedMnemonic = ethers.Wallet.createRandom().mnemonic?.phrase
      }
      wallet = ethers.Wallet.fromMnemonic(usedMnemonic!, path)
      result = {
        walletAddress: wallet.address,
        publicKey: wallet.publicKey,
        encryptedPrivateKey: encrypt(wallet.privateKey, walletPassword),
        derivationPath: path,
        mnemonic: walletType === 'imported' ? usedMnemonic : undefined
      }
    }

    // Never store mnemonic, only return if imported and user requests
    return res.json({
      walletAddress: result.walletAddress,
      publicKey: result.publicKey,
      encryptedPrivateKey: result.encryptedPrivateKey,
      derivationPath: result.derivationPath,
      mnemonic: result.mnemonic // Only for imported
    })
  } catch (err: any) {
    return res.json({ error: err.message || 'Wallet creation failed' }, 500)
  }
}
