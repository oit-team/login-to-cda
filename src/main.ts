import { sm3, sm2 } from 'sm-crypto'
import { getKey, login } from './api'

const privateKey = 'fe32419fdf9e8a2db5a94b009b0b5dbaea425c046258cfb665c14e1c709693b2'

function assert(value: any, msg?: string): asserts value {
  if (!value) throw new TypeError(msg)
}

async function setup() {
  const searchParams = new URLSearchParams(location.href.split('?')[1])
  const encryptData = searchParams.get('data')
  const timestamp = searchParams.get('t')

  if (!timestamp || +timestamp < Date.now() - 1000 * 2) {
    alert('请求过期，请重试')
    window.close()
    return
  }

  assert(encryptData, 'data is null')

  const dataTrimmed = encryptData.replace(/^04/, '')
  const params = sm2.doDecrypt(dataTrimmed, privateKey, 1).split('XX@XX')

  const username = params[2]
  const password = params[3]
  const url = params[4]

  assert(username, 'username is null')
  assert(password, 'password is null')
  assert(url, 'url is null')

  const { publicKey: publicKeyRaw } = await getKey()
  const publicKey = publicKeyRaw.split('\r\n')[0]
  const encrypted = sm3(password)

  console.log('publicKey =>', publicKey)
  console.log('encrypted =>', encrypted)

  const { accesstoken } = await login({
    username,
    password: encrypted,
  })

  console.log('accesstoken =>', accesstoken)

  localStorage.setItem('cda__ACCESS_TOKEN', accesstoken)
  localStorage.setItem('cda__CODE', publicKey)

  location.replace(url)
}

setup()
  .catch(e => {
    console.error(e)
    window.alert(typeof e === 'object' ? JSON.stringify(e) : e)
  })
