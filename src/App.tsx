/* eslint-disable no-console */
'use strict'

import * as React from 'react'
import {
  Router,
  Route,
  Switch
} from "react-router-dom";
import { Image, Center, Container, Heading, Text, VStack, Link, Flex, Box, Stack, Button, useColorMode, HStack, Grid, GridItem } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import Minter from './Minter'
import Browser  from './Browser'
import { AlgorandWalletConnector } from './AlgorandWalletConnector'
import NFTViewer from './NFTViewer'
import Portfolio from './Portfolio'
import ListingViewer from './ListingViewer'
import Admin from './Admin'
import {SessionWallet, PermissionResult, SignedTxn, Wallet} from 'algorand-session-wallet'
import {platform_settings as ps} from './lib/platform-conf'
import {RequestPopupProps, RequestPopup, PopupPermission, DefaultPopupProps} from './RequestPopup'


type AppProps = {
  history: any
};

const timeout = async(ms: number) => new Promise(res => setTimeout(res, ms));

export default function App(props: AppProps) {

  const [popupProps, setPopupProps] = React.useState(DefaultPopupProps)
  const { colorMode, toggleColorMode } = useColorMode();

  const popupCallback = {
    async request(pr: PermissionResult): Promise<SignedTxn[]> {
      let result = PopupPermission.Undecided;
      setPopupProps({isOpen:true, handleOption: (res: PopupPermission)=>{ result = res} })		
      

      async function wait(): Promise<SignedTxn[]> {
        while(result === PopupPermission.Undecided) await timeout(50);

        if(result == PopupPermission.Proceed) return pr.approved()
        return pr.declined()
      }

      //get signed
      const txns = await wait()

      //close popup
      setPopupProps(DefaultPopupProps)

      //return signed
      return txns
    }
  }

  const sw = new SessionWallet(ps.algod.network, popupCallback)
  const [sessionWallet, setSessionWallet] =  React.useState(sw)
  const [accts, setAccounts] = React.useState(sw.accountList())
  const [connected, setConnected] = React.useState(sw.connected())

  function updateWallet(sw: SessionWallet){ 
    setSessionWallet(sw)
    setAccounts(sw.accountList())
    setConnected(sw.connected())
  }

  const wallet = sessionWallet.wallet
  const acct = sessionWallet.getDefaultAccount()

  let adminNav = <div/>
  if(connected  && (ps.application.admin_addr == "" || acct == ps.application.admin_addr)) {
    adminNav = <Link icon='key' href="/admin">Admin</Link>
  }

  let mint = <div/>
  let portfolio = <div/>
  if(connected){
    mint =<Link icon='clean' href="/mint">Mint</Link>
    portfolio = <Link icon='folder-open' href="/portfolio">Portfolio</Link>
  }

  return (
      <div>
        <Router history={props.history} >
          <Container maxW="100%">
                <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
                    <HStack spacing={8}>
                        <a href='/'><Image alt="aphnft.com" w="150px" h="55px" src={require('./img/logo.png')} /></a>
                        <Text>
                            APH NFT
                        </Text>
                        <Link icon='grid-view' href="/">Browse</Link>
                        {mint}
                        {portfolio}
                    </HStack>
                    <Flex alignItems={'center'}>
                        <Stack direction={'row'} spacing={7}>
                            <Button onClick={toggleColorMode}>
                                {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                            </Button>
                            <HStack>
                                {adminNav}
                                <AlgorandWalletConnector 
                                  darkMode={true}
                                  sessionWallet={sessionWallet}
                                  accts={accts}
                                  connected={connected} 
                                  updateWallet={updateWallet}
                                  />
                            </HStack>
                        </Stack>
                    </Flex>
                </Flex>
            </Container>
          <Switch>
            <Route path="/portfolio" >
              <Portfolio history={props.history} wallet={wallet} acct={acct} /> 
            </Route>
            <Route path="/portfolio/:addr" >
              <Portfolio history={props.history} wallet={wallet} acct={acct} /> 
            </Route>

            <Route path="/mint" children={<Minter history={props.history} wallet={wallet} acct={acct} /> } />
            <Route path="/nft/:id" children={<NFTViewer history={props.history} wallet={wallet} acct={acct} /> } />
            <Route path="/listing/:addr" children={<ListingViewer  history={props.history} wallet={wallet} acct={acct} />} />

            <Route exact path="/" >
              <Browser history={props.history} wallet={wallet} acct={acct} />
            </Route>
            <Route path="/tag/:tag"  >
              <Browser history={props.history} wallet={wallet} acct={acct} />
            </Route>
            <Route path="/admin"  >
              <Admin history={props.history} wallet={wallet} acct={acct} />
            </Route>
          </Switch>
        </Router>
        <RequestPopup {...popupProps}/>
      </div>
  )
}
