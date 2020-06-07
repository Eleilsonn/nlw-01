import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import './styles.css';
import logo from '../../assets/logo.svg';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import api from '../../services/api';
import api_IBGE from '../../services/api_IBGE';

import Dropzone from '../../components/dropzone';

/**
 * array ou objeto: manualmente informa o tipo da variavel
 */

interface Item {
    id: number,
    image: string,
    title: string
}

interface Uf {
    id: number,
    sigla: string,
    nome: string
}

interface City {
    id: number,
    nome: string
}

const CreatePoint = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<Uf[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [selectedFile, setSelectedFile] = useState<File>();


    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
    })

    const [selectedUf, setSelectedUf] = useState("0");
    const [selectedCity, setSelectedCity] = useState("0");
    const [selectedLatLng, setSelectedLatLng] = useState<[number, number]>([0, 0]);
    const [selectedItems, setSeletedItems] = useState<number[]>([]);

    const history = useHistory();

    useEffect(() => {
        api.get('items')
            .then(response => {
                setItems(response.data);
            })
    }, [])
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
    //gelocalização
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            setSelectedLatLng([position.coords.latitude, position.coords.longitude]);
            setInitialPosition([position.coords.latitude, position.coords.longitude])
        });
    }, [])

    function handleSelectedUF(event: ChangeEvent<HTMLSelectElement>) {
        setSelectedUf(event.target.value);
    }

    function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>) {
        setSelectedCity(event.target.value);
    }

    function handleMapClick(event: LeafletMouseEvent) {
        setSelectedLatLng([event.latlng.lat, event.latlng.lng]);
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const { value, name } = event.target;
        setFormData({ ...formData, [name]: value })
    }

    function handleSelectedItem(id: number) {
        selectedItems.includes(id) ? setSeletedItems(selectedItems.filter(idSelected => idSelected !== id)) : setSeletedItems([...selectedItems, id]);
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const { name, email, whatsapp } = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude, longitude] = selectedLatLng;
        const items = selectedItems.toString();

        const data = new FormData();

        data.append('name', name);
        data.append('email', email);
        data.append('whatsapp', whatsapp);
        data.append('uf', uf);
        data.append('city', city);
        data.append('latitude', String(latitude));
        data.append('longitude', String(longitude));
        data.append('items', items);
        if (selectedFile)
            data.append('image', selectedFile)


        api.post('points', data)
            .then(() => {
                alert('Salvo com sucesso.');
                history.push('/');
            })
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="logo" />

                <Link to="/">
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br /> ponto de coleta</h1>

                <Dropzone onFileUploaded={setSelectedFile} />

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input type="text" name="name" id="name" onChange={handleInputChange} />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input type="text" name="email" id="email" onChange={handleInputChange} />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input type="text" name="whatsapp" id="whatsapp" onChange={handleInputChange} />
                        </div>

                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço do mapa</span>
                    </legend>

                    <Map center={initialPosition} zoom={15} onclick={handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position={selectedLatLng} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select name="uf" id="uf" value={selectedUf} onChange={handleSelectedUF}>
                                <option value="">Selecione um estado</option>
                                {ufs.map(uf => (
                                    <option value={uf.sigla} key={uf.id}>{uf.nome}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city" value={selectedCity} onChange={handleSelectedCity}>
                                <option value="">Selecione uma cidade</option>
                                {cities.map(city => (
                                    <option value={city.nome} key={city.id}>{city.nome}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais items abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item => (
                            <li className={selectedItems.includes(item.id) ? "selected" : ""} key={item.id} onClick={() => { handleSelectedItem(item.id) }}>
                                <img src={item.image} alt="" />
                                <span>{item.title}</span>
                            </li>
                        )
                        )}
                    </ul>
                </fieldset>

                <button type="submit">Cadastrar ponto de coleta</button>
            </form>
        </div>
    )
}

export default CreatePoint; 