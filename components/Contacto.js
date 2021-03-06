import React from 'react'
import {
    Text,
    View,
    Modal,
    TouchableHighlight,
} from 'react-native'
import * as Contacts from 'expo-contacts'
import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system'
import * as DocumentPicker from 'expo-document-picker'
import * as IntentLauncher from 'expo-intent-launcher'
import { styles } from '../styles.js'

import { getVcardTemplate, createFileName } from '../utils.js'
import { NewContacts } from './NewContacts'

export default class Contacto extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            oldContactModal: null,
            newContacts: [],
            newRecordsUri: null
        }
    }

    timeout = (delay) => new Promise((res) => setTimeout(res, delay))

    compareNumbers = async () => {
        const result = await DocumentPicker.getDocumentAsync({})

        if (result.type === 'success') {
            if (!result.name.includes('contacts.json')) {
                alert('You have to select contacts.json')
                return        
            } else {
                alert(`You've picked the file: ${result.name}`)
            }

            const { uri } = result
            if (uri) {
                try {
                    const jsonContacts = await FileSystem.readAsStringAsync(uri)
                    const parsedContacts = JSON.parse(jsonContacts)
                    const { status } = await Contacts.requestPermissionsAsync()

                    if (status === 'granted') {
                        // Getting contacts with permissions on android
                        const { data } = await Contacts.getContactsAsync({
                            fields: [
                                Contacts.PHONE_NUMBERS,
                            ],
                        })

                        const numbers = []
                        data.map((number) => {
                            const { phoneNumbers } = number
                            if (phoneNumbers) {
                                let phoneNumber = phoneNumbers[0]?.number
                                phoneNumber = phoneNumber.replace(/\s+/g, '')
                                numbers.push(phoneNumber)
                            }
                        })

                        const newContacts = []
                        let vCardTotal = ''
                        parsedContacts.map((contact) => {
                            const { name, number, id } = contact

                            // Finding unrecorded phone numbers
                            const exist = numbers.find((currentNumber) => currentNumber === number)
                            
                            if (!exist) {
                                newContacts.push({ id, name, number })
                                const vCard = getVcardTemplate(name, number)
                                vCardTotal += vCard
                            } else {
                                console.log(`${number} is exist !`)
                            }
                        })

                        const newRecordsUri = createFileName(FileSystem, 'new_contacts.vcf')
                        this.setState({ newContacts, newRecordsUri })
                        if (vCardTotal) {
                            await this.writeContactsToFile(newRecordsUri, vCardTotal)
                        } else {
                            alert('Your contacts are up to date !')
                        }
                    }
                } catch (err) {
                    throw new Error(err)
                }
            }
        } else {
            alert('You have to give permission for comparing contacts !')
        }
    }

    importNewContacts = async () => {
        const { newRecordsUri } = this.state

        await FileSystem.getContentUriAsync(newRecordsUri).then((cUri) => {
            IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                data: cUri,
                type: 'text/x-vcard',
                flags: 1,
            })
        })
    }

    getPhoneContacts = async () => {
        const { status } = await Contacts.requestPermissionsAsync()

        if (status === 'granted') {
            // Getting contacts with permissions on android
            const { data } = await Contacts.getContactsAsync({
                fields: [
                    Contacts.PHONE_NUMBERS,
                ],
            })

            // Getting data we need.
            const contacts = []
            data.map((number) => {
                const { name, phoneNumbers, id } = number
                if (name && phoneNumbers && id) {
                    let phoneNumber = phoneNumbers[0]?.number
                    phoneNumber = phoneNumber.replace(/\s+/g, '')
                    contacts.push({ name, number: phoneNumber, id })
                }
            })
            
            // Let's write phone contacts to a json file.
            const jsonContacts = JSON.stringify(contacts)
            const uri = createFileName(FileSystem, 'contacts.json')
            await this.writeContactsToFile(uri, jsonContacts)
            await this.sendOldPhoneContacts(uri)
        }
    }

    sendOldPhoneContacts = async (uri) => {
        if (!(await Sharing.isAvailableAsync())) {
            alert('Uh oh, sharing isn\'t available on your platform')
        } else {
            if (uri) {
                await Sharing.shareAsync(uri)
            } else {
                alert('There is no contacts.json file !')
            }
        }
    }

    writeContactsToFile = async (uri, records) => {
        // This only write contacts to a file
        try {
            await FileSystem.writeAsStringAsync(uri, records)
        } catch (err) {
            throw new Error(err)
        }
    }

    setVisibilityOfModal = (visible) => this.setState({ oldContactModal: visible })

    renderSection = () => {
        const { newContacts } = this.state

        if (newContacts.length > 0) {
            return (
                <View>
                    <Text style={styles.usage}>
                      Now press Import contacts
                    </Text>
                    <TouchableHighlight
                        underlayColor="grey"
                        style={styles.importButton}
                        onPress={() => this.importNewContacts()}
                    >
                        <Text style={styles.textStyle}>Import Contacts</Text>
                    </TouchableHighlight>
                    <NewContacts data={newContacts} />
                </View>
            )
        }
        return (
            <View style={styles.information}>
                <Text style={styles.infoHeader}>How to use ?</Text>
                <Text style={styles.infoText}>Send your old phone contacts to your email</Text>
                <Text style={styles.infoText}>Download contacts.json on your new phone</Text>
                <Text style={styles.infoText}>Pick contacts.json, then press import contacts.</Text>
            </View>
        )
    }

    render() {
        const { oldContactModal } = this.state

        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.welcomeText}>CONTACTO</Text>
                    <Text style={styles.altText}>will help rid of your pain</Text>
                </View>
                <View style={styles.section}>
                    { this.renderSection() }
                    <Modal
                        animationType="fade"
                        transparent
                        visible={oldContactModal}
                        onRequestClose={() => this.setVisibilityOfModal(false)}
                    >
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <Text style={styles.modalText}>Do you want to send phone contacts to your email ?</Text>
                                <View style={{ flexDirection: 'row' }}>
                                    <TouchableHighlight
                                        style={{ ...styles.openButton, backgroundColor: '#78FFF1' }}
                                        underlayColor="grey"
                                        onPress={() => {
                                            this.setVisibilityOfModal(false)
                                            this.getPhoneContacts()
                                        }}
                                    >
                                        <Text style={{ ...styles.textStyle, color: 'black' }}>Yes</Text>
                                    </TouchableHighlight>
                                    <TouchableHighlight
                                        underlayColor="grey"
                                        style={{ ...styles.openButton, backgroundColor: '#FF6495' }}
                                        onPress={() => this.setVisibilityOfModal(false)}
                                    >
                                        <Text style={styles.textStyle}>Cancel</Text>
                                    </TouchableHighlight>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
                <View style={styles.bottom}>
                    <TouchableHighlight
                        underlayColor="grey"
                        style={{ ...styles.openButton, backgroundColor: '#361999' }}
                        onPress={() => this.setVisibilityOfModal(true)}
                    >
                        <Text style={styles.textStyle}>Send Contacts</Text>
                    </TouchableHighlight>
                    <TouchableHighlight
                        underlayColor="grey"
                        style={{ ...styles.openButton, backgroundColor: '#361999' }}
                        onPress={() => this.compareNumbers()}
                    >
                        <Text style={styles.textStyle}>Compare Numbers</Text>
                    </TouchableHighlight>

                </View>
            </View>
        )
    }
}
