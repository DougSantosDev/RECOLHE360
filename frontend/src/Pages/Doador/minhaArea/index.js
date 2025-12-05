import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useUser } from '../../../context/UsarContext';

export default function MinhaArea() {
  const { user, updateAddress } = useUser();
  const [editMode, setEditMode] = useState(false);

  const [telefone, setTelefone] = useState(user?.phone || '');
  const [street, setStreet] = useState(user?.address_street || '');
  const [number, setNumber] = useState(user?.address_number || '');
  const [neighborhood, setNeighborhood] = useState(user?.address_neighborhood || '');
  const [city, setCity] = useState(user?.address_city || '');
  const [state, setState] = useState(user?.address_state || '');
  const [zip, setZip] = useState(user?.address_zip || '');

  const formatAddress = () => {
    return [
      street,
      number && `, ${number}`,
      neighborhood && ` - ${neighborhood}`,
      city && `, ${city}`,
      state && ` - ${state}`,
      zip && `, ${zip}`,
    ]
      .filter(Boolean)
      .join('');
  };

  const handleSalvar = async () => {
    try {
      await updateAddress({
        phone: telefone || null,
        address_street: street || null,
        address_number: number || null,
        address_neighborhood: neighborhood || null,
        address_city: city || null,
        address_state: state || null,
        address_zip: zip || null,
      });
      setEditMode(false);
      Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
    } catch (err) {
      Alert.alert('Erro', err?.message || 'Nao foi possivel atualizar os dados.');
    }
  };

  return (
    <View style={styles.background}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View style={styles.card}>
          <Text style={styles.titulo}>Minha Area</Text>
          {editMode ? (
            <>
              <Text style={styles.label}>Nome</Text>
              <TextInput style={styles.input} value={user?.name || ''} editable={false} />
              <Text style={styles.label}>Email</Text>
              <TextInput style={styles.input} value={user?.email || ''} editable={false} />
              <Text style={styles.label}>Telefone</Text>
              <TextInput style={styles.input} value={telefone} onChangeText={setTelefone} placeholder="Telefone" />

              <Text style={styles.label}>Rua</Text>
              <TextInput style={styles.input} value={street} onChangeText={setStreet} placeholder="Rua" />
              <Text style={styles.label}>Numero</Text>
              <TextInput style={styles.input} value={number} onChangeText={setNumber} placeholder="Numero" />
              <Text style={styles.label}>Bairro</Text>
              <TextInput style={styles.input} value={neighborhood} onChangeText={setNeighborhood} placeholder="Bairro" />
              <Text style={styles.label}>Cidade</Text>
              <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Cidade" />
              <Text style={styles.label}>Estado (UF)</Text>
              <TextInput style={styles.input} value={state} onChangeText={setState} maxLength={2} placeholder="UF" />
              <Text style={styles.label}>CEP</Text>
              <TextInput style={styles.input} value={zip} onChangeText={setZip} placeholder="CEP" />

              <TouchableOpacity style={styles.botao} onPress={handleSalvar}>
                <Text style={styles.textoBotao}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelar} onPress={() => setEditMode(false)}>
                <Text style={styles.cancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Nome:</Text>
                <Text style={styles.infoValue}>{user?.name}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{user?.email}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Telefone:</Text>
                <Text style={styles.infoValue}>{telefone || 'Nao informado'}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Endereco:</Text>
                <Text style={styles.infoValue}>{formatAddress() || 'Nao informado'}</Text>
              </View>
              <TouchableOpacity style={styles.botao} onPress={() => setEditMode(true)}>
                <Text style={styles.textoBotao}>Editar Dados</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#fffacd',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 28,
    elevation: 4,
    shadowColor: '#329845',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    marginVertical: 32,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#329845',
    textAlign: 'center',
    marginBottom: 26,
    letterSpacing: 0.6,
  },
  label: {
    fontSize: 17,
    color: '#329845',
    fontWeight: '600',
    marginBottom: 3,
    marginTop: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d6d6d6',
    borderRadius: 10,
    backgroundColor: '#fffacd',
    padding: 10,
    fontSize: 16,
    marginBottom: 6,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f6ffe7',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8cf',
  },
  infoLabel: {
    color: '#329845',
    fontWeight: 'bold',
    width: 90,
    fontSize: 16,
  },
  infoValue: {
    color: '#444',
    fontSize: 16,
    flexShrink: 1,
  },
  botao: {
    backgroundColor: '#329845',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 18,
    alignItems: 'center',
    elevation: 2,
  },
  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  cancelar: {
    marginTop: 10,
    alignItems: 'center',
  },
  cancelarTexto: {
    color: '#d32f2f',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
