import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { SvgUri } from 'react-native-svg';
import * as Location from 'expo-location';
import api from '../../services/api';

interface Item {
    id: number,
    image: string,
    title: string
}

interface Point{
    id: number,
    image: string,
    name: string,
    latitude: number,
    longitude: number,
}

interface Params {
    uf:string,
    city: string
}

const Points = () => {
    const route = useRoute();
    const params = route.params as Params
    const [items, setItems] = useState<Item[]>([]);
    const [points, setPoints] = useState<Point[]>([]);
    const [selectedItems, setSeletedItems] = useState<number[]>([]);
    const [initialPositial, setInitialPositial] = useState<[number, number]>([0,0]);

    const navegation = useNavigation();

    //buscando itens
    useEffect(() => {
        api.get('items')
            .then(response => {
                setItems(response.data);
            })
    }, [])
    //localização
    useEffect(() => {
        async function loadPosition() {
            const { status } = await Location.requestPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Ooooops...', 'Precisamos de sua permissão para obter a localização.');
                return;
            }

            const location = await Location.getCurrentPositionAsync();

            const { latitude, longitude } = location.coords;
            
            setInitialPositial([latitude, longitude]);
        }
        loadPosition();
    }, []);
    //carregar pontos
    useEffect(()=>{
        api.get('points',{
            params:{
                city: params.city,
                uf: params.uf,
                items: selectedItems.toString()
            }
        }).then(response=>{            
            setPoints(response.data);
        })

    },[selectedItems])

    function handleNavegateBack() {
        navegation.goBack();
    }

    function handleNavigateToDetail(id: number) {
        navegation.navigate('Detail',{point_id:id});
    }

    function handleSelectedItem(id: number) {
        selectedItems.includes(id) ? setSeletedItems(selectedItems.filter(idSelected => idSelected !== id)) : setSeletedItems([...selectedItems, id]);
    }

    return (
        <>
            <View style={styles.container}>
                <TouchableOpacity onPress={handleNavegateBack}>
                    <Icon name="arrow-left" color="#34cb79" size={26} />
                </TouchableOpacity>

                <Text style={styles.title}>Bem vindo.</Text>
                <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>

                <View style={styles.mapContainer}>
                    {initialPositial[0] !== 0 && (
                        <MapView style={styles.map}                    
                        initialRegion={{
                            latitude: initialPositial[0],
                            longitude: initialPositial[1],
                            latitudeDelta: 0.014,
                            longitudeDelta: 0.014
                        }}>
                            {points.map(point=>(
                                <Marker
                                    key={String(point.id)}
                                    style={styles.mapMarker}
                                    onPress={()=>handleNavigateToDetail(point.id)}
                                    coordinate={{
                                        latitude: point.latitude,
                                        longitude: point.longitude,
                                    }}>
                                    <View style={styles.mapMarkerContainer}>
                                        <Image style={styles.mapMarkerImage} source={{ uri: point.image }} />
                                        <Text style={styles.mapMarkerTitle}>{point.name}</Text>
                                    </View>
                                </Marker>
                            ))}
                        </MapView>
                    )}
                </View>
            </View>

            <View style={styles.itemsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                    {items.map(item => (
                        <TouchableOpacity 
                        activeOpacity={0.6}
                        key={String(item.id)} 
                        style={[styles.item, selectedItems.includes(item.id) ? styles.selectedItem : {}]}
                        onPress={() => handleSelectedItem(item.id)}
                        >
                            <SvgUri width={42} height={42} uri={item.image} />
                            <Text style={styles.itemTitle}>{item.title}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 32,
        paddingTop: 20 + Constants.statusBarHeight,
    },

    title: {
        fontSize: 20,
        fontFamily: 'Ubuntu_700Bold',
        marginTop: 24,
    },

    description: {
        color: '#6C6C80',
        fontSize: 16,
        marginTop: 4,
        fontFamily: 'Roboto_400Regular',
    },

    mapContainer: {
        flex: 1,
        width: '100%',
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 16,
    },

    map: {
        width: '100%',
        height: '100%',
    },

    mapMarker: {
        width: 90,
        height: 80,
    },

    mapMarkerContainer: {
        width: 90,
        height: 70,
        backgroundColor: '#34CB79',
        flexDirection: 'column',
        borderRadius: 8,
        overflow: 'hidden',
        alignItems: 'center'
    },

    mapMarkerImage: {
        width: 90,
        height: 45,
        resizeMode: 'cover',
    },

    mapMarkerTitle: {
        flex: 1,
        fontFamily: 'Roboto_400Regular',
        color: '#FFF',
        fontSize: 13,
        lineHeight: 23,
    },

    itemsContainer: {
        flexDirection: 'row',
        marginTop: 16,
        marginBottom: 32,
    },

    item: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#eee',
        height: 120,
        width: 120,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 16,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'space-between',

        textAlign: 'center',
    },

    selectedItem: {
        borderColor: '#34CB79',
        borderWidth: 2,
    },

    itemTitle: {
        fontFamily: 'Roboto_400Regular',
        textAlign: 'center',
        fontSize: 13,
    },
});

export default Points;