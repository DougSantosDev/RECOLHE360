import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { useThemeRecolhe } from '../../context/ThemeContext';

const privacyText = `Política de Privacidade - RECOLHE360
Última atualização: dezembro/2025

1. Quem somos
O RECOLHE360 conecta doadores de materiais recicláveis a coletores e cooperativas, promovendo a coleta seletiva e o descarte consciente.

2. Dados pessoais tratados
- Identificação: nome, e-mail, telefone.
- Endereço e coordenadas para coleta.
- Dados de uso e logs de acesso.
- Histórico de coletas, materiais e status.

3. Finalidades
- Autenticação e manutenção da conta.
- Pareamento entre doadores e coletores.
- Otimização de rotas, notificações essenciais e suporte.
- Geração de métricas agregadas sobre impacto ambiental.

4. Bases legais (LGPD)
Execução de contrato, consentimento, legítimo interesse avaliado e cumprimento de obrigações legais.

5. Compartilhamento
Somente o necessário entre doador/coletor, parceiros institucionais de forma limitada, provedores de infraestrutura com confidencialidade e autoridades mediante obrigação legal.

6. Segurança
Criptografia em trânsito, controle de acesso, monitoramento e backups.

7. Retenção
Dados ativos enquanto a conta existir ou para obrigações legais. Posteriormente são eliminados ou anonimizados.

8. Direitos do titular
Confirmar tratamento, acessar, corrigir, solicitar anonimização/eliminação, portabilidade e revogar consentimento pelos canais de suporte.

9. Localização
Usada apenas com consentimento para agendamentos e rotas; pode ser desativada com possíveis limitações.

10. Cookies
Utilizados para manter a sessão e coletar métricas de uso.

11. Comunicações
Avisos essenciais e mensagens opcionais controladas nas configurações.

12. Transferência internacional
Se houver, aplicamos salvaguardas contratuais conforme LGPD.

13. Menores
Destinado a maiores de 18 anos.

14. Atualizações
Notificaremos mudanças relevantes dentro do app.

15. Contato do DPO
privacidade@recolhe360.com.br`;

const termsText = `Termos de Uso - RECOLHE360
Última atualização: dezembro/2025

1. Objetivo
Conectar doadores e coletores para coletas agendadas de materiais recicláveis.

2. Aceitação
O uso do app implica concordância com estes Termos e com a Política de Privacidade.

3. Cadastro
Forneça dados verdadeiros e mantenha-os atualizados; uso permitido para maiores de 18 anos.

4. Responsabilidades
Doadores: informar materiais corretos, permitir acesso no horário e manter endereço atualizado.
Coletores: aceitar apenas o que puder cumprir, atualizar status e manter comunicação respeitosa.

5. Status de coleta
Fluxo: pendente → aceito → a caminho → chegou → concluído (ou cancelado). O coletor atualiza sua rota e o doador confirma a coleta ao final.

6. Localização
Endereço e coordenadas são usados para roteamento. Geolocalização é facultativa porém recomendada.

7. Conduta
É proibido conteúdo ofensivo, ilícito ou o uso do app para fins indevidos.

8. Segurança
Proteja suas credenciais; comunique suspeitas ao suporte.

9. Suspensão
Violação dos termos, fraude ou uso indevido podem encerrar ou suspender a conta.

10. Limitação de responsabilidade
O serviço é disponibilizado “no estado em que se encontra”; não respondemos por danos indiretos decorrentes de mau uso.

11. Privacidade
O tratamento de dados segue a Política de Privacidade e a LGPD.

12. Notificações
Enviamos avisos operacionais essenciais; preferências opcionais podem ser gerenciadas.

13. Alterações
Termos podem ser atualizados; o uso continuado significa concordância.

14. Suporte
Canal pelo app ou suporte@recolhe360.com.br.

15. Foro
Legislação brasileira; foro de São Paulo/SP, salvo regras específicas para consumidores.`;

const contentMap = {
  privacy: { title: 'Política de Privacidade', body: privacyText },
  terms: { title: 'Termos de Uso', body: termsText },
};

export default function LegalModal() {
  const navigation = useNavigation();
  const route = useRoute();
  const type = route.params?.type === 'terms' ? 'terms' : 'privacy';
  const data = contentMap[type];
  const { dark } = useThemeRecolhe();

  const palette = useMemo(
    () => ({
      bg: dark ? '#0f1410' : '#F3F7EE',
      card: dark ? '#1b1f1b' : '#FFFFFF',
      text: dark ? '#E6E6E6' : '#111827',
      muted: dark ? '#9aa3a6' : '#6B7280',
      primary: '#1b4332',
    }),
    [dark],
  );

  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      <View style={[styles.header, { borderBottomColor: palette.muted }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.close}>
          <Icon name="x" size={22} color={palette.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: palette.primary }]}>{data.title}</Text>
      </View>
      <ScrollView contentContainerStyle={[styles.content, { backgroundColor: palette.card }]}>
        <Text style={[styles.body, { color: palette.text }]}>{data.body}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
  },
  close: { padding: 6 },
  title: { fontSize: 18, fontWeight: '700' },
  content: { paddingHorizontal: 16, paddingVertical: 20 },
  body: { fontSize: 15, lineHeight: 22 },
});
