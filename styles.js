import { StyleSheet, Dimensions } from 'react-native'

const windowHeight = Dimensions.get('window').height * 0.12
const styles = StyleSheet.create({
    container: {
        flex: 6,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        flex: 1,
        marginVertical: windowHeight,
        justifyContent: 'center',
    },
    section: {
        flex: 4,
        justifyContent: 'center',
    },
    bottom: {
        flex: 1,
        flexDirection: 'row',
        textAlign: 'center',
    },
    information: {
        marginBottom: 200,
        justifyContent: 'center',
        backgroundColor: '#361999',
        borderRadius: 10,
        width: 300,
        padding: 10,
        marginLeft: Dimensions.get('window').width * 0.02,
    },
    infoHeader: {
        fontSize: 30,
        color: 'white',
    },
    infoText: {
        fontSize: 15,
        color: 'white',
    },
    importButton: {
        backgroundColor: '#FF6495',
        borderRadius: 10,
        padding: 10,
        elevation: 1,
        textAlign: 'center',
        alignItems: 'center',
    },
    button: {
        marginVertical: 10,
        backgroundColor: 'red',
    },
    welcomeText: {
        fontSize: 50,
        textAlign: 'center',
    },
    altText: {
        fontSize: 20,
        textAlign: 'center',
    },
    usage: {
        fontSize: 17,
        textAlign: 'center',
        marginBottom: Dimensions.get('window').height * 0.01,
        backgroundColor: '#FF6495',
        color: 'white',
        padding: 10,
        borderRadius: 10,
        marginVertical: 3,
    },
    modalView: {
        margin: 20,
        backgroundColor: '#361999',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    openButton: {
        backgroundColor: '#F194FF',
        borderRadius: 10,
        padding: 10,
        elevation: 1,
        marginVertical: 2,
        margin: 5,
        width: 150,
        height: 50,
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        alignSelf: 'center',
        height: 20,
        maxWidth: 150,
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        color: 'white',
        fontSize: 15,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
})

module.exports = { styles }
