import { Agent, InboundTransporter } from 'aries-framework'
import fetch from 'node-fetch'

class PollingInboundTransporter implements InboundTransporter {
  public stop: boolean

  public constructor() {
    this.stop = false
  }
  public async start(agent: Agent) {
    await this.registerMediator(agent)
  }

  public async registerMediator(agent: Agent) {
    try {
      const mediatorUrl = agent.getMediatorUrl() || ''
      const mediatorInvitationUrl = await (await fetch(`${mediatorUrl}/invitation`)).text()
      const { verkey: mediatorVerkey } = await (await fetch(`${mediatorUrl}/`)).json()
      await agent.routing.provision({
        verkey: mediatorVerkey,
        invitationUrl: mediatorInvitationUrl,
      })
      this.pollDownloadMessages(agent)
    } catch (e) {
      console.log(e.message)
    }
  }

  private pollDownloadMessages(agent: Agent) {
    const loop = async () => {
      while (!this.stop) {
        await agent.routing.downloadMessages()
        await new Promise((res) => setTimeout(res, 2000))
      }
    }
    new Promise(() => {
      loop()
    })
  }
}

export { PollingInboundTransporter }
