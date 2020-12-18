import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-elements';
import * as Contacts from 'expo-contacts';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Linking from 'expo-linking';
import * as IntentLauncher from 'expo-intent-launcher';
import { getVcardTemplate, createFileName } from '../utils.js'

export default class Contacto extends React.Component{
    constructor(props) {
        super(props)
    }

    timeout = (delay) => new Promise(res => setTimeout(res, delay))

    compareNumbers = async () => {
        const result = await DocumentPicker.getDocumentAsync({});
        
        if (result.type === 'success') {
            const message = `You've picked the file: ${result.name}, Now select the vcf file called new_contacts.vcf`
            alert(message)
            await this.timeout(2000)

            const { uri } = result
            if (uri) {
                try {
                    const jsonContacts = await FileSystem.readAsStringAsync(uri)
                    console.log('Reading is succesfull !')

                    const parsedContacts = JSON.parse(jsonContacts)

                    const { status } = await Contacts.requestPermissionsAsync()

                    if (status === 'granted') {
                      // Getting contacts with permissions on android
                      const { data } = await Contacts.getContactsAsync({
                          fields: [
                              Contacts.PHONE_NUMBERS,
                          ]
                      })
           
                      const numbers = []
                      data.map(number => {
                          const { phoneNumbers } = number
                          let phoneNumber = phoneNumbers[0]?.number
                          phoneNumber = phoneNumber.replace(/\s+/g, "");
                          numbers.push(phoneNumber)
                      })

                      let vCardTotal
                      parsedContacts.map(contact => {
                          const { name, number } = contact
  
                          // Finding unrecorded phone numbers !
                          const exist = numbers.find((currentNumber) => currentNumber === number)
                            
                          if (!exist) {
                              let vCard = getVcardTemplate(name, number)
                              vCardTotal += vCard
                          } else {
                              console.log(`${number} is exist !`)
                          }
  
                      })

                      const newRecordUri = createFileName(FileSystem, 'new_contacts.vcf')
                      await this.writeContactsToFile(newRecordUri, vCardTotal)
                      await this.importNewContacts()
                    }          
                } catch (err) {
                    throw new Error(err)
                }
            }
        }
    }

    importNewContacts = async () => {
        const result = await DocumentPicker.getDocumentAsync({});
        
        if (result.type === 'success') {
            const message = `You've picked the file: ${result.name}`
            alert(message)
            
            const { uri } = result

            console.log(uri)
            // this will ensure, mime type is vCard, it'll import new contacts !
            await FileSystem.getContentUriAsync(uri).then(cUri => {
                console.log(cUri)
                IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                  data: cUri.uri,
                  type: 'text/x-vcard',
                  flags: 1,
                });
              });
        }
    }

    getPhoneContacts = async () => {
      const { status } = await Contacts.requestPermissionsAsync()
      
        if (status === 'granted') {
            // Getting contacts with permissions on android
            const { data } = await Contacts.getContactsAsync({
                fields: [
                    Contacts.PHONE_NUMBERS,
                ]
            })

            // Getting data we need.
            const contacts = []
            data.map(number => {
              const { name, phoneNumbers } = number
              let phoneNumber = phoneNumbers[0]?.number
              phoneNumber = phoneNumber.replace(/\s+/g,"");
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
        const options = {
            mimeType: 'text/x-vcard',
            dialogTitle: 'Share vcard',
            UTI: 'text/vcard',
        }

        if (!(await Sharing.isAvailableAsync())) {
            alert(`Uh oh, sharing isn't available on your platform`)
            return
        }

        if (uri) {
            await Sharing.shareAsync(uri, options)
        } else {
            alert('There is no contacts vcf file !')
        }
    }

    writeContactsToFile = async (uri, records) => {
        // This only write contacts to a file
        try {
            await FileSystem.writeAsStringAsync(uri, records)
            console.log('Writing is succesfull !')
        } catch (err) {
            throw new Error(err)
        }
  }

    render() {
        return (
            <View style={styles.container}>
              <Text style={styles.welcomeText}>CONTACTO</Text>
              <Text style={styles.altText}>will help rid of your pain</Text>
              <Button
                  buttonStyle={styles.button}
                  onPress={() => this.getPhoneContacts()}
                  title="Send old contacts"
              />
              <Button
                  buttonStyle={styles.button}
                  onPress={() => this.compareNumbers()}
                  title="Compare numbers"
              />
              <StatusBar style="auto" />
            </View>
          )
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    button: {
      marginVertical: 15,
      backgroundColor: 'red',
    },
    welcomeText: {
      fontSize: 40,
    },
    altText: {
        fontSize: 15,
      }
});
