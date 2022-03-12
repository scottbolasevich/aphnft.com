import { createStandaloneToast } from '@chakra-ui/react'
const toast = createStandaloneToast()

export function showInfo(info: string){
    toast({
        title: 'showInfo',
        description: info,
        status: 'info',
        duration: 9000,
        isClosable: true,
    })
}

export function showNetworkWaiting(txId: string) {
    toast({
        title: 'showNetworkWaiting',
        description: 'Transaction Sent: ' + txId,
        status: 'info',
        duration: 9000,
        isClosable: true,
    })
}

export function showNetworkSuccess(txId: string) {
    toast({
        title: 'Success',
        description: 'Transaction Success: ' + txId,
        status: 'success',
        duration: 9000,
        isClosable: true,
    })
}

export function showNetworkError(txId: string, message: string) {
    toast({
        title: 'An error occurred.',
        description: 'Transaction Failed: ' + txId + ', ' + message,
        status: 'error',
        duration: 9000,
        isClosable: true,
    })
}

export function showErrorToaster(message: string) {
    toast({
        title: 'An error occurred.',
        description: message,
        status: 'error',
        duration: 9000,
        isClosable: true,
    })
}