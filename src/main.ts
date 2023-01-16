import { sm3 } from 'sm-crypto'
import { getKey, login } from './api'

function assert(value: any, msg?: string): asserts value {
  if (!value) throw new TypeError(msg)
}

async function setup() {
  const searchParams = new URLSearchParams(location.href.split('?')[1])
  const base64Data = searchParams.get('data')
  const timestamp = searchParams.get('t')

  if (!timestamp || +timestamp < Date.now() - 1000 * 25) {
    alert('请求过期，请重试')
    window.close()
    return
  }

  assert(base64Data, 'data is null')

  const params = atob(base64Data).split('XX@XX')

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
