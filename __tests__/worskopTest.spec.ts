import { AxiosResponse } from 'axios'
import { remote } from 'webdriverio'

import truskApi from '../src/api-requests/trusk-api'
import environment from '../src/environment'
import randomUtils from '../src/random-utils'
import truskBusiness from '../src/web-pages/trusk-business'
import webUtils from '../src/web-utils'

/**
    - Create b2b_default user account using Trusk API
    - Login the test b2b account using Trusk APi and catch the auth token
    - Open Trusk Business
    - Set Cookie token = previous auth token
    - Quote form is displayed on Trusk Business
    - Fill and submit the quote form
    - Order created panel appears
 */

describe('Workshop Test Scenario', () => {
  let webdriver: WebdriverIO.Browser
  const testUniqueIdentifier = randomUtils.generateRandomDigits(6)
  const testUserEmail = `adrian+test.pro.user.${testUniqueIdentifier}@trusk.com`
  const testUserPassword = 'password'
  let testUserAuthToken: string

  beforeAll(async () => {
    const baseOptions = {
      capabilities: {
        browserName: process.env.SE_EVENT_BUS_HOST ? 'firefox' : 'chrome',
      },
    }
    webdriver = await remote(process.env.SE_EVENT_BUS_HOST ? {
      ...baseOptions,
      hostname: process.env.SE_EVENT_BUS_HOST,
      port: 4444,
      path: '/',
      services: ['docker'],
    } : baseOptions)
  }, 30000)

  afterAll(async () => {
    await webdriver.deleteSession()
  }, 30000)

  it('Create b2b_default user account using Trusk API', async () => {
    const createUserResponse: AxiosResponse = await truskApi.createUser({
      completeName: `Test Pro User ${testUniqueIdentifier}`,
      email: testUserEmail,
      phoneNumber: `06${testUniqueIdentifier}12`,
      password: testUserPassword,
      pricing: 'b2b_default',
      store: {
        name: `Test Store ${testUniqueIdentifier}`,
      },
    })
    expect(createUserResponse.status).toBe(201)
  }, 30000)

  it('Login the test b2b account using Trusk APi and catch the auth token', async () => {
    const loginResponse = await truskApi.login({
      email: testUserEmail,
      password: testUserPassword,
    })
    expect(loginResponse.status).toBe(200)
    expect(loginResponse.data.token).toStrictEqual(expect.any(String))
    testUserAuthToken = loginResponse.data.token
  }, 30000)

  it('Open Trusk Business', async () => {
    await webdriver.navigateTo(environment.truskBusinessBaseUrl)
  }, 30000)

  it('Set Cookie token = previous auth token', async () => {
    await webdriver.setCookies({
      name: 'token',
      value: testUserAuthToken,
    })
    await webdriver.waitUntil(async () => {
      const tokenCookie = await webdriver.getCookies('token')
      return tokenCookie.length === 1
    })
    await webdriver.refresh()
  }, 30000)

  it('Quote form is displayed on Trusk Business', async () => {
    await webdriver.waitUntil(async () => {
      const currentUrl = await webdriver.getUrl()
      return currentUrl === `${environment.truskBusinessBaseUrl}/fr/`
    }, { timeout: 10000, interval: 2500 })
    webdriver.waitUntil(
      async () => {
        const documentState = await webdriver.execute(() => document.readyState)
        return documentState === 'complete'
      },
      {
        timeout: 60 * 1000,
        timeoutMsg: 'Le chargement de la page est pas complete meme apres 60 secondes',
        interval: 3000,
      },
    )
    await webUtils.waitForElementToBePresentBySelector(
      webdriver,
      truskBusiness.quoteForm.startAddressInputXPath,
    )
  }, 30000)

  it('Fill the quote form', async () => {
    await truskBusiness.quoteForm.fillStartAddressInput(webdriver, '66 rue du couedic')
    await truskBusiness.quoteForm.selectStartAddressFromSuggestions(webdriver, '66 Rue du Couëdic, Paris, France')
    await truskBusiness.quoteForm.fillEndAddressInput(webdriver, '14 rue palouzie')
    await truskBusiness.quoteForm.selectEndAddressFromSuggestions(webdriver, '14 Rue Palouzié, Saint-Ouen, France')
    await truskBusiness.quoteForm.selectEndFloorsFromSuggestions(webdriver, 'RDC')
    await truskBusiness.quoteForm.selectTotalWeight(webdriver, 'Moins de 350kg')
    await truskBusiness.quoteForm.selectNumberOfTruskers(webdriver, '1 Trusker')
    await truskBusiness.quoteForm.fillPackagesNumber(webdriver, '1')
    await truskBusiness.quoteForm.waitForEstimationPanelToBeVisible(webdriver)
    await truskBusiness.quoteForm.fillOrderDetails(webdriver, `test ${testUniqueIdentifier}`)
    await truskBusiness.quoteForm.fillOrderNumber(webdriver, `TEST-ORDER-${testUniqueIdentifier}`)
    await truskBusiness.quoteForm.fillStartContactCompleteName(webdriver, `Start Contact ${testUniqueIdentifier}`)
    await truskBusiness.quoteForm.fillStartContactPhoneNumber(webdriver, `06${testUniqueIdentifier}13`)
    await truskBusiness.quoteForm.fillEndContactCompleteName(webdriver, `End Contact ${testUniqueIdentifier}`)
    await truskBusiness.quoteForm.fillEndContactPhoneNumber(webdriver, `06${testUniqueIdentifier}14`)
  }, 30000)

  it('Submit quote form on Trusk Business', async () => {
    await truskBusiness.quoteForm.submitForm(webdriver)
  }, 30000)

  it('Order created panel appears', async () => {
    await truskBusiness.quoteForm.waitForOrderCreatedPanelToBeVisible(webdriver)
  }, 30000)
})
