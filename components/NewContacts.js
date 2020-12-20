import React from 'react'
import {
    FlatList, View, Text, StyleSheet, Dimensions,
} from 'react-native'

const Item = ({ contact }) => {
    const { name, number } = contact
    return (
        <View style={styles.item}>
            <Text style={styles.title}>
                {name}
                {' '}
            |{' '}{number}
            </Text>
        </View>
    )
}

export const NewContacts = (props) => {
    const { data } = props

    if (data?.length > 0) {
        return (
            <FlatList
                style={styles.list}
                data={data}
                renderItem={({ item }) => <Item contact={item} />}
                keyExtractor={(item) => item.id.toString()}
            />
        )
    }
}

const styles = StyleSheet.create({
    list: {
        flex: 1,
        marginBottom: Dimensions.get('window').height * 0.15,
        flexGrow: 3,
    },
    item: {
        backgroundColor: '#361999',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 10,
        textAlign: 'center',
    },
    title: {
        fontSize: 15,
        color: 'white',
        textAlign: 'center',
    },
})
