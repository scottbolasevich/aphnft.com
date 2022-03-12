/* eslint-disable no-console */
'use strict'

import * as React from 'react'
import { SessionWallet, allowedWallets } from 'algorand-session-wallet'
import { HStack, VStack, Modal, ModalBody, ModalOverlay, ModalContent, ModalHeader, ModalFooter, Box, Button, Select } from '@chakra-ui/react'
import { NotAllowedIcon } from '@chakra-ui/icons'
import { useEffect } from 'react'
import { showErrorToaster } from './Toaster'
import {platform_settings as ps } from './lib/platform-conf'
import { useDisclosure } from "@chakra-ui/react"


type AlgorandWalletConnectorProps = {
    darkMode: boolean
    connected: boolean
    accts: string[]
    sessionWallet: SessionWallet
    updateWallet(sw: SessionWallet)
}

export function AlgorandWalletConnector(props:AlgorandWalletConnectorProps)  {

    const [selectorOpen, setSelectorOpen] = React.useState(false)
    const cancelRef = React.useRef()
    const { isOpen, onOpen, onClose } = useDisclosure()

    useEffect(()=>{ connectWallet() },[props.sessionWallet])

    async function connectWallet() {
        if(props.sessionWallet.connected()) return

        await props.sessionWallet.connect()
        props.updateWallet(props.sessionWallet)
    }

    function disconnectWallet() { 
        props.sessionWallet.disconnect()
        props.updateWallet(new SessionWallet(props.sessionWallet.network, props.sessionWallet.permissionCallback)) 
    }

    function handleDisplayWalletSelection() { setSelectorOpen(true) }

    async function handleSelectedWallet(e) {
        const choice = e.currentTarget.id

        if(!(choice in allowedWallets)) {
            props.sessionWallet.disconnect()
            return setSelectorOpen(false)
        }

        const sw = new SessionWallet(props.sessionWallet.network, props.sessionWallet.permissionCallback, choice)

        if(!await sw.connect()) {
            sw.disconnect()
            showErrorToaster("Couldn't connect to wallet") 
        }

        props.updateWallet(sw)

        setSelectorOpen(false)
    }

    function handleChangeAccount(e) {
        props.sessionWallet.setAccountIndex(parseInt(e.target.value))
        props.updateWallet(props.sessionWallet)
    }

    const walletOptions = []
    for(const [k,v] of Object.entries(allowedWallets).splice(0, 2)){
        walletOptions.push((
        <div key={k}>
            <Button id={k} leftIcon={<img width='50px' height='50px' src={v.img(props.darkMode)} />} size='lg' variant='outline' onClick={handleSelectedWallet}> 
                {v.displayName()}
            </Button>
        </div>
        ))
    }

    if (!props.connected) return (
        <div>
            <Button variant='outline' onClick={handleDisplayWalletSelection}>Connect Wallet</Button>
            <Modal isOpen={selectorOpen} onClose={onClose} >
                <ModalOverlay>
                    <ModalContent>
                        <ModalHeader fontSize='lg' fontWeight='bold'>
                        Select Wallet
                        </ModalHeader>
                        <ModalBody>
                            <VStack>
                                {walletOptions}
                            </VStack>
                        </ModalBody>
                        <ModalFooter>
                        <Button ref={cancelRef} onClick={handleSelectedWallet}>
                            Cancel
                        </Button>
                        </ModalFooter>
                    </ModalContent>
                </ModalOverlay>
            </Modal>
        </div>
    )

    const addr_list = props.accts.map((addr, idx) => {
        return (<option value={idx} key={idx}> {addr.substr(0, 8)}...  </option>)
    })

    return (
        <HStack>
            <Select 
                onChange={handleChangeAccount} 
                defaultValue={props.sessionWallet.accountIndex()} >
                {addr_list}
            </Select>
            <Button onClick={disconnectWallet}><NotAllowedIcon/></Button>
        </HStack>
    )
}