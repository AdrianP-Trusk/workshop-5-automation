import { After, Before } from '@cucumber/cucumber'
import { remote } from 'webdriverio'

import { CustomWorld } from './world'

Before({ tags: '@webdriver' }, async function(this: CustomWorld) {
  const baseOptions = {
    capabilities: {
      browserName: process.env.SE_EVENT_BUS_HOST ? 'firefox' : 'chrome',
    },
  }
  this.browser = await remote(process.env.SE_EVENT_BUS_HOST ? {
    ...baseOptions,
    hostname: process.env.SE_EVENT_BUS_HOST,
    port: 4444,
    path: '/',
    services: ['docker'],
  } : baseOptions)
})

After({ tags: '@webdriver' }, async function(this: CustomWorld, args) {
  await this.browser?.deleteSession()
})
