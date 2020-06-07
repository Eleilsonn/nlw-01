import React,{useState, useEffect} from 'react';
import {View, ImageBackground,StyleSheet, Image,Text} from 'react-native';
import {RectButton} from 'react-native-gesture-handler';
import {Feather as Icon} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import PickerSelect from 'react-native-picker-select';
import api_IBGE from '../../services/api_IBGE';

const logo = require('../../assets/logo.png');
const imageBackground = require('../../assets/home-background.png');

interface Uf {
  id: number,
  sigla: string,
  nome: string
}

interface City {
  id: number,
  nome: string
}

const Home = ()=>{
  const navigation = useNavigation();
  const [ufs, setUfs] = useState<Uf[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  const [selectedUf, setSelectedUf] = useState("0");
  const [selectedCity, setSelectedCity] = useState("0");

  //buscar ufs
  useEffect(() => {
    api_IBGE.get('estados')
        .then(response => {
            setUfs(response.data);
        })
}, [])

//buscar cidades
useEffect(() => {
    if (selectedUf === '0')
        return;

    api_IBGE.get(`estados/${selectedUf}/municipios`)
        .then(response => {
            setCities(response.data)
        })
}, [selectedUf])

  function handleNavigateToPoints(){
    navigation.navigate('Points',{uf: selectedUf, city: selectedCity});
  }
    return (
        <ImageBackground 
        source={imageBackground}
        style={styles.container}
        imageStyle={styles.imageBackground}>
            <View style={styles.main}>
                <Image source={logo}/>
                <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
                <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coletas de forma eficiente.</Text>
            </View>
            <View style={styles.footer}>
                
                <PickerSelect
                Icon={()=>(<Icon name="chevron-down" size={20} color="#6C6C80"/>)}
                style={{viewContainer:styles.input, iconContainer:{marginTop:20, marginRight:15}, placeholder:{color:'#6C6C80'}}}
                placeholder={{label:"Selecione um estado"}}
                onValueChange={(value)=>setSelectedUf(value)}
                items={ufs.map(uf=>{return {label: uf.nome, value: uf.sigla}})}
                />

                <PickerSelect
                Icon={()=>(<Icon name="chevron-down" size={20} color="#6C6C80"/>)}
                style={{viewContainer:styles.input, iconContainer:{marginTop:20, marginRight:15}, placeholder:{color:'#6C6C80'}}}                
                placeholder={{label:"Selecione uma cidade"}}
                onValueChange={(value)=>setSelectedCity(value)}
                items={cities.map(cities=>{return {label: cities.nome, value: cities.nome}})}
                />

                <RectButton style={styles.button} onPress={handleNavigateToPoints}>
                    <View style={styles.buttonIcon}>
                        <Icon name="arrow-right" color="#fff" size={24}/>
                    </View>
                    <Text style={styles.buttonText}>Entrar</Text>
                </RectButton>
            </View>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 32      
    },
  
    main: {
      flex: 1,
      justifyContent: 'center',
    },
  
    title: {
      color: '#322153',
      fontSize: 32,
      fontFamily: 'Ubuntu_700Bold',
      maxWidth: 260,
      marginTop: 64,
    },
  
    description: {
      color: '#6C6C80',
      fontSize: 16,
      marginTop: 16,
      fontFamily: 'Roboto_400Regular',
      maxWidth: 260,
      lineHeight: 24,
    },
  
    footer: {},
  
    select: {},
  
    input: {
      height: 60,
      backgroundColor: '#FFF',
      borderRadius: 10,
      marginBottom: 8,
      paddingHorizontal: 24,
      fontSize: 16,
    },
  
    button: {
      backgroundColor: '#34CB79',
      height: 60,
      flexDirection: 'row',
      borderRadius: 10,
      overflow: 'hidden',
      alignItems: 'center',
      marginTop: 8,
    },
  
    buttonIcon: {
      height: 60,
      width: 60,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      justifyContent: 'center',
      alignItems: 'center'
    },
  
    buttonText: {
      flex: 1,
      justifyContent: 'center',
      textAlign: 'center',
      color: '#FFF',
      fontFamily: 'Roboto_500Medium',
      fontSize: 16,
    },
    imageBackground: {
        width:274,
        height:368
    }
  });

export default Home;