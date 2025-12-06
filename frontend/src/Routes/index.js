// src/routes/index.js

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Feather from 'react-native-vector-icons/Feather';
import { useUser } from '../context/UsarContext';
import { useThemeRecolhe } from '../context/ThemeContext';

// Importando telas
import Welcome from '../Pages/Welcome';
import Escolha from '../Pages/Escolha';
import SignIn from '../Pages/SignIn';
import SignUp from '../Pages/SignUp';
import Configuracoes from '../Pages/configuracoes';
import Sobre from '../Pages/Sobre';
// DOADOR
import HomeDoador from '../Pages/Doador/Home';
import RecicladosDoador from '../Pages/Doador/Reciclados';
import NoticiasDoador from '../Pages/Doador/Noticias';
import AgendamentosDoador from '../Pages/Doador/Agendamentos';
import NovoAgendamento from '../Pages/Doador/Agendamentos/NovoAgendamentos';
import NoticiasDetalhes from '../Pages/Doador/Noticias/NoticiasDetalhes';
import MinhaContaDoador from '../Pages/Doador/minhaArea';

// COLETOR
import HomeColetor from '../Pages/Coletor/HomeColetor';
import RotasColetor from '../Pages/Coletor/RotasColetor';
import MetasColetor from '../Pages/Coletor/MetasColetor';
import AgendamentosColetor from '../Pages/Coletor/AgendamentoColetor';
import MinhaContaColetor from '../Pages/Doador/minhaArea';

// Legal modal
import LegalModal from '../Pages/Legal/LegalModal';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

function usePalette(dark) {
  return {
    bg: dark ? '#0f1410' : '#f2fdf2',
    card: dark ? '#1b1f1b' : '#ffffff',
    text: dark ? '#e6e6e6' : '#222',
    muted: dark ? '#9aa3a6' : '#555',
    primary: '#2f7a4b',
    drawerBg: dark ? '#181d18' : '#fff',
    border: dark ? '#2f3b30' : '#e0e0e0',
  };
}

function CustomDrawerContent(props) {
  const { logout } = useUser();
  const { dark } = useThemeRecolhe();
  const palette = usePalette(dark);

  const handleLogout = () => {
    logout();
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <View style={styles.logoutContainer}>
        <TouchableOpacity
          onPress={handleLogout}
          style={[styles.logoutButton, { backgroundColor: '#d32f2f' }]}
        >
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

function TabNavigatorDoador() {
  const { dark } = useThemeRecolhe();
  const palette = usePalette(dark);
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: palette.card,
          borderTopColor: palette.border,
        },
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.muted,
      }}
    >
      <Tab.Screen
        name="HomeTabDoador"
        component={HomeDoador}
        options={{
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
          title: 'Início',
        }}
      />
      <Tab.Screen
        name="RecicladosTabDoador"
        component={RecicladosDoador}
        options={{
          tabBarIcon: ({ color, size }) => <Feather name="trash-2" size={size} color={color} />,
          title: 'Reciclados',
        }}
      />
      <Tab.Screen
        name="NoticiasTabDoador"
        component={NoticiasDoador}
        options={{
          tabBarIcon: ({ color, size }) => <Feather name="book-open" size={size} color={color} />,
          title: 'Tudo sobre ♻️',
        }}
      />
      <Tab.Screen
        name="AgendamentosTabDoador"
        component={AgendamentosDoador}
        options={{
          tabBarIcon: ({ color, size }) => <Feather name="mail" size={size} color={color} />,
          title: 'Agendamentos',
        }}
      />
    </Tab.Navigator>
  );
}

function TabNavigatorColetor() {
  const { dark } = useThemeRecolhe();
  const palette = usePalette(dark);
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: palette.card,
          borderTopColor: palette.border,
        },
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.muted,
      }}
    >
      <Tab.Screen
        name="HomeTabColetor"
        component={HomeColetor}
        options={{
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
          title: 'Início',
        }}
      />
      <Tab.Screen
        name="RotasTabColetor"
        component={RotasColetor}
        options={{
          tabBarIcon: ({ color, size }) => <Feather name="map" size={size} color={color} />,
          title: 'Rotas',
        }}
      />
      <Tab.Screen
        name="MetasTabColetor"
        component={MetasColetor}
        options={{
          tabBarIcon: ({ color, size }) => <Feather name="target" size={size} color={color} />,
          title: 'Metas',
        }}
      />
      <Tab.Screen
        name="AgendamentosTabColetor"
        component={AgendamentosColetor}
        options={{
          tabBarIcon: ({ color, size }) => <Feather name="calendar" size={size} color={color} />,
          title: 'Agendamentos',
        }}
      />
    </Tab.Navigator>
  );
}

function DrawerNavigatorDoador() {
  const { dark } = useThemeRecolhe();
  const palette = usePalette(dark);
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: palette.card },
        headerTintColor: palette.text,
        drawerStyle: { backgroundColor: palette.drawerBg },
        drawerActiveTintColor: palette.primary,
        drawerInactiveTintColor: palette.muted,
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="HomeDrawerDoador"
        component={TabNavigatorDoador}
        options={{ title: 'Principal' }}
      />
      <Drawer.Screen name="MinhaConta" component={MinhaContaDoador} options={{ title: 'Minha Conta' }} />
      <Drawer.Screen name="Configuracoes" component={Configuracoes} />
      <Drawer.Screen name="Sobre" component={Sobre} />
    </Drawer.Navigator>
  );
}

function DrawerNavigatorColetor() {
  const { dark } = useThemeRecolhe();
  const palette = usePalette(dark);
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: palette.card },
        headerTintColor: palette.text,
        drawerStyle: { backgroundColor: palette.drawerBg },
        drawerActiveTintColor: palette.primary,
        drawerInactiveTintColor: palette.muted,
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="HomeDrawerColetor"
        component={TabNavigatorColetor}
        options={{ title: 'Principal' }}
      />
      <Drawer.Screen name="MinhaConta" component={MinhaContaColetor} options={{ title: 'Minha Conta' }} />
      <Drawer.Screen name="Configuracoes" component={Configuracoes} />
      <Drawer.Screen name="Sobre" component={Sobre} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  logoutContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  logoutButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default function Routes() {
  const { signed, tipo } = useUser();
  const { dark } = useThemeRecolhe();
  const palette = usePalette(dark);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: palette.bg },
      }}
    >
      {!signed ? (
        <>
          <Stack.Screen name="Welcome" component={Welcome} />
          <Stack.Screen name="Escolha" component={Escolha} />
          <Stack.Screen name="SignIn" component={SignIn} />
          <Stack.Screen name="SignUp" component={SignUp} />
        </>
      ) : tipo === 'doador' ? (
        <Stack.Screen name="AppDoadorStack" component={DrawerNavigatorDoador} />
      ) : (
        <Stack.Screen name="AppColetorStack" component={DrawerNavigatorColetor} />
      )}
      <Stack.Screen name="NovoAgendamento" component={NovoAgendamento} />
      <Stack.Screen
        name="NoticiasDetalhes"
        component={NoticiasDetalhes}
        options={{ title: 'Tudo sobre ??' }}
      />
      <Stack.Screen
        name="LegalModal"
        component={LegalModal}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
