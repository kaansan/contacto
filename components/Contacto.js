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
import NewContacts from './NewContacts'

export default class Contacto extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            oldContactModal: null,
            newContacts: [],
        }
    }

    timeout = (delay) => new Promise((res) => setTimeout(res, delay))

    compareNumbers = async () => {
        const result = await DocumentPicker.getDocumentAsync({})

        if (result.type === 'success') {
            const message = `You've picked the file: ${result.name}, Now select the vcf file called new_contacts.vcf`
            alert(message)

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
                            let phoneNumber = phoneNumbers[0]?.number
                            phoneNumber = phoneNumber.replace(/\s+/g, '')
                            numbers.push(phoneNumber)
                        })

                        const newContacts = []
                        let vCardTotal
                        parsedContacts.map((contact) => {
                            const { name, number } = contact

                            // id for FlatList
                            const id = Math.floor(Math.random() * Math.floor(10000))
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

                        this.setState({ newContacts })
                        const newRecordUri = createFileName(FileSystem, 'new_contacts.vcf')
                        if (vCardTotal) {
                            await this.writeContactsToFile(newRecordUri, vCardTotal)
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
        const result = await DocumentPicker.getDocumentAsync({})

        if (result.type === 'success') {
            const { uri } = result

            // this will ensure, mime type is vCard, it'll import new contacts !
            await FileSystem.getContentUriAsync(uri).then((cUri) => {
                IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                    data: cUri.uri,
                    type: 'text/x-vcard',
                    flags: 1,
                })
            })
        }
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
                const { name, phoneNumbers } = number
                let phoneNumber = phoneNumbers[0]?.number
                phoneNumber = phoneNumber.replace(/\s+/g, '')
                contacts.push({ name, number: phoneNumber })
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
            return
        }

        if (uri) {
            await Sharing.shareAsync(uri)
        } else {
            alert('There is no contacts.json file !')
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
                      Now press Import contacs, and choose file called:<Text style={{ color: 'black' }}>new_contacts.vcf</Text>It&apos;ll import below contacts.
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
                <Text style={styles.infoText}>Send your old phone contacts to your email as contacts.json.</Text>
                <Text style={styles.infoText}>Download contacts.json on your new phone</Text>
                <Text style={styles.infoText}>Pick contacts.json, this will create a new_contacts.vcf file.</Text>
                <Text style={styles.infoText}>Then you can use new_contacts.vcf to add new contacts to your phone.</Text>
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
