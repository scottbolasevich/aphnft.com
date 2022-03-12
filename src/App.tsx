/* eslint-disable no-console */
'use strict'

import * as React from 'react'
import {
  Router,
  Route,
  Switch
} from "react-router-dom";
import { ReactNode } from 'react';
import {
  Box,
  Flex,
  Avatar,
  HStack,
  Link,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  useColorMode,
  Stack,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, MoonIcon, SunIcon, AddIcon, InfoIcon } from '@chakra-ui/icons';
import Minter from './Minter'
import Browser  from './Browser'
import Home  from './Home'
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

const Links = ['explore'];

const NavLink = ({ children }: { children: string }) => (
  <Link
    px={2}
    py={1}
    rounded={'md'}
    _hover={{
      textDecoration: 'none',
      bg: useColorModeValue('gray.200', 'gray.700'),
    }}
    href={'/'+children}>
    {children}
  </Link>
);

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
    mint =<NavLink>mint</NavLink>
    portfolio = <NavLink>portfolio</NavLink>
  }

  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
      <div>
        <Router history={props.history} >
        <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
          <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
            <IconButton
              size={'md'}
              icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
              aria-label={'Open Menu'}
              display={{ md: 'none' }}
              onClick={isOpen ? onClose : onOpen}
            />
            <HStack spacing={8} alignItems={'center'}>
              <Link href="/"><img alt="aphnft.com" width="100rem" src={require('./img/logo.svg')} /></Link>
              <HStack
                as={'nav'}
                spacing={4}
                display={{ base: 'none', md: 'flex' }}>
                {Links.map((link) => (
                  <NavLink key={link}>{link}</NavLink>
                ))}
                {mint}
                {portfolio}
              </HStack>
            </HStack>
            <Flex alignItems={'center'}>
              <Stack direction={'row'} spacing={7}>
                <Button onClick={toggleColorMode}>
                    {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                </Button>
                <Menu>
                  <MenuButton
                    as={Button}
                    rounded={'full'}
                    variant={'link'}
                    cursor={'pointer'}
                    minW={0}>
                    <InfoIcon boxSize={6}/>
                  </MenuButton>
                  <MenuList>
                    <AlgorandWalletConnector 
                          darkMode={true}
                          sessionWallet={sessionWallet}
                          accts={accts}
                          connected={connected} 
                          updateWallet={updateWallet}
                          />
                    <MenuDivider />
                    <MenuItem>My NFTs</MenuItem>
                    <MenuItem>My Listings</MenuItem>
                  </MenuList>
                </Menu>
                </Stack>
              </Flex>
          </Flex>

          {isOpen ? (
            <Box pb={4} display={{ md: 'none' }}>
              <Stack as={'nav'} spacing={4}>
                {Links.map((link) => (
                  <NavLink key={link}>{link}</NavLink>
                ))}
              </Stack>
            </Box>
          ) : null}
        </Box>
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
              <Home history={props.history} wallet={wallet} acct={acct} />
            </Route>
            <Route exact path="/explore" >
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
