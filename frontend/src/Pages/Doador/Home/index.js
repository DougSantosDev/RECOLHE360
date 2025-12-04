import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
  Dimensions,
  FlatList,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

const conquistas = [
  { id: "1", title: "Bronze", description: "Reciclou 10kg", icon: require("../../../../assets/image/download.png") },
  { id: "2", title: "Prata", description: "Reciclou 20kg", icon: require("../../../../assets/image/download.png") },
  { id: "3", title: "Ouro", description: "Reciclou 30kg", icon: require("../../../../assets/image/download.png") },
];

export default function HomeDoador() {
  const navigation = useNavigation();

  const progress = useRef(new Animated.Value(0)).current;
  const progressPercent = 0.83;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: progressPercent,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerWrapper}>
          <View>
            <Text style={styles.welcomeText}>👋 Olá, Doador</Text>
            <Text style={styles.welcomeSub}>
              Acompanhe seu impacto e continue transformando o lixo em oportunidade 🌱
            </Text>
          </View>
          <View style={styles.levelPill}>
            <Icon name="award" size={16} color="#fff" />
            <Text style={styles.levelText}>Eco Nível 3</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total reciclado</Text>
            <Text style={styles.summaryValue}>25kg</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Coletas feitas</Text>
            <Text style={styles.summaryValue}>8</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>CO₂ evitado</Text>
            <Text style={styles.summaryValue}>12kg</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌍 Seu impacto</Text>
          <Text style={styles.impactText}>
            Você já reciclou <Text style={styles.bold}>25kg</Text> de materiais neste mês.
          </Text>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>Meta do mês: 30kg</Text>
            <Text style={styles.metaPercent}>83% concluído</Text>
          </View>
        </View>

        <View style={[styles.card, { paddingBottom: 10 }]}>
          <Text style={styles.cardTitle}>📈 Evolução semanal</Text>
          <Text style={styles.cardSubtitle}>
            Veja como você vem contribuindo com o RECOLHE360 na última semana.
          </Text>
          <LineChart
            data={{
              labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
              datasets: [
                {
                  data: [2, 3, 4, 5, 6, 5, 7],
                  color: (opacity = 1) => `rgba(82, 183, 136, ${opacity})`,
                  strokeWidth: 3,
                },
              ],
            }}
            width={screenWidth - 60}
            height={170}
            chartConfig={{
              backgroundColor: "#f2fdf2",
              backgroundGradientFrom: "#f2fdf2",
              backgroundGradientTo: "#f2fdf2",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(52, 102, 67, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(76, 110, 84, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "5",
                strokeWidth: "2",
                stroke: "#52b788",
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.card, styles.flexCard]}>
            <Text style={styles.cardTitle}>💡 Dica do dia</Text>
            <Text style={styles.tipText}>
              1 tonelada de papel reciclado pode salvar até <Text style={styles.bold}>20 árvores</Text>. Continue separando seus resíduos!
            </Text>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate("NoticiasTabDoador")}
            >
              <Text style={styles.linkButtonText}>Ver mais dicas</Text>
              <Icon name="arrow-right" size={14} color="#2d6a4f" />
            </TouchableOpacity>
          </View>

          <View style={[styles.card, styles.flexCard]}>
            <Text style={styles.cardTitle}>⚡ Atalhos rápidos</Text>
            <TouchableOpacity
              style={styles.shortcutButton}
              onPress={() => navigation.navigate("RecicladosTabDoador")}
            >
              <Icon name="plus-circle" size={16} color="#fff" />
              <Text style={styles.shortcutText}>Agendar coleta</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.shortcutButton, { backgroundColor: "#52b788" }]}
              onPress={() => navigation.navigate("AgendamentosTabDoador")}
            >
              <Icon name="calendar" size={16} color="#fff" />
              <Text style={styles.shortcutText}>Meus agendamentos</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📦 Próxima coleta</Text>
          <Text style={styles.coletaText}>
            Confirmada para <Text style={styles.bold}>25/04</Text> — Plástico e papel.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("AgendamentosTabDoador")}
          >
            <Icon name="calendar" size={18} color="#fff" />
            <Text style={styles.buttonText}>Ver detalhes</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { paddingBottom: 12 }]}>
          <Text style={styles.cardTitle}>🏅 Conquistas</Text>
          <Text style={styles.cardSubtitle}>
            Continue reciclando para desbloquear novos níveis e medalhas.
          </Text>
          <FlatList
            data={conquistas}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 10 }}
            renderItem={({ item }) => (
              <View style={styles.badgeCard}>
                <Image source={item.icon} style={styles.badgeIcon} />
                <Text style={styles.badgeTitle}>{item.title}</Text>
                <Text style={styles.badgeDesc}>{item.description}</Text>
              </View>
            )}
          />
        </View>

        <TouchableOpacity
          style={styles.bigButton}
          onPress={() => navigation.navigate("RecicladosTabDoador")}
        >
          <Icon name="plus-circle" size={20} color="#fff" />
          <Text style={styles.bigButtonText}>Agendar nova coleta</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F4F8F4" },
  container: { padding: 20, paddingBottom: 32 },
  headerWrapper: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginTop: 10, marginBottom: 18 },
  welcomeText: { fontSize: 22, fontWeight: "700", color: "#1b4332", marginBottom: 4 },
  welcomeSub: { fontSize: 13, color: "#4c6e54", maxWidth: "80%" },
  levelPill: { backgroundColor: "#2d6a4f", flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, gap: 6 },
  levelText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  summaryCard: { flex: 1, backgroundColor: "#ffffff", borderRadius: 14, paddingVertical: 10, paddingHorizontal: 10, marginHorizontal: 4, shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  summaryLabel: { fontSize: 11, color: "#6c757d", marginBottom: 4 },
  summaryValue: { fontSize: 16, fontWeight: "700", color: "#2d6a4f" },
  card: { backgroundColor: "#ffffff", borderRadius: 16, padding: 18, width: "100%", marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.08, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: "600", color: "#40916c", marginBottom: 8 },
  cardSubtitle: { fontSize: 13, color: "#6c757d", marginBottom: 8 },
  impactText: { fontSize: 15, marginBottom: 10, color: "#333" },
  progressBar: { height: 10, backgroundColor: "#d8f3dc", borderRadius: 10, overflow: "hidden", marginBottom: 6 },
  progressFill: { backgroundColor: "#52b788", height: "100%", width: "0%" },
  metaRow: { flexDirection: "row", justifyContent: "space-between" },
  meta: { fontSize: 13, color: "#6c757d" },
  metaPercent: { fontSize: 13, color: "#2d6a4f", fontWeight: "600" },
  row: { flexDirection: "row", gap: 12, marginBottom: 8 },
  flexCard: { flex: 1 },
  tipText: { fontSize: 14, color: "#333", marginBottom: 10 },
  linkButton: { marginTop: 4, flexDirection: "row", alignItems: "center", gap: 4 },
  linkButtonText: { fontSize: 13, color: "#2d6a4f", fontWeight: "600" },
  shortcutButton: { backgroundColor: "#40916c", flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 8, borderRadius: 10, marginTop: 6, gap: 6 },
  shortcutText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  coletaText: { fontSize: 15, marginBottom: 10, color: "#333" },
  button: { backgroundColor: "#40916c", flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, borderRadius: 10, marginTop: 4, gap: 6 },
  buttonText: { color: "#fff", fontWeight: "600" },
  bigButton: { backgroundColor: "#2d6a4f", flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 14, marginTop: 4, marginBottom: 24, width: "100%", gap: 8 },
  bigButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  bold: { fontWeight: "bold", color: "#2d6a4f" },
  badgeCard: { backgroundColor: "#e6f0e8", borderRadius: 12, padding: 14, marginRight: 16, alignItems: "center", width: 120, shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  badgeIcon: { width: 48, height: 48, marginBottom: 8, resizeMode: "contain" },
  badgeTitle: { fontWeight: "700", color: "#2d6a4f", marginBottom: 4 },
  badgeDesc: { fontSize: 12, color: "#4c6e54", textAlign: "center" },
});
