import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Linking,
    TouchableOpacity,
} from 'react-native';
import { theme } from '../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Globe, Phone, Mail, Heart } from 'lucide-react-native';

const INFO_ITEMS = [
    {
        icon: '🏢',
        title: '¿Quiénes somos?',
        content:
            'FEVADIS es la Federación Valenciana de Asociaciones en Favor de las Personas con Discapacidad Intelectual o del Desarrollo. Trabajamos para mejorar la calidad de vida de las personas con discapacidad y sus familias.',
    },
    {
        icon: '🎯',
        title: 'Nuestra misión',
        content:
            'Promover la inclusión social y la autonomía de las personas con discapacidad intelectual mediante programas de voluntariado, actividades culturales, formación y apoyo a las familias.',
    },
    {
        icon: '🤝',
        title: 'El voluntariado',
        content:
            'Nuestros voluntarios son el motor de nuestras actividades. Si quieres unirte, contacta con nosotros para recibir tu DNI autorizado y completar el registro en esta app.',
    },
];

const CONTACT_ITEMS = [
    {
        icon: Globe,
        label: 'Web',
        value: 'www.fevadis.es',
        action: () => Linking.openURL('https://www.fevadis.es'),
    },
    {
        icon: Phone,
        label: 'Teléfono',
        value: '963 XXX XXX',
        action: () => Linking.openURL('tel:963000000'),
    },
    {
        icon: Mail,
        label: 'Email',
        value: 'info@fevadis.es',
        action: () => Linking.openURL('mailto:info@fevadis.es'),
    },
];

export default function InfoScreen() {
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoCircle}>
                        <Text style={styles.logoText}>F</Text>
                    </View>
                    <Text style={styles.orgName}>FEVADIS</Text>
                    <Text style={styles.orgSub}>Federación Valenciana de Asociaciones</Text>
                </View>

                {/* Info sections */}
                {INFO_ITEMS.map((item) => (
                    <View key={item.title} style={styles.card}>
                        <Text style={styles.cardIcon}>{item.icon}</Text>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.cardContent}>{item.content}</Text>
                    </View>
                ))}

                {/* Contact section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contacto</Text>
                    {CONTACT_ITEMS.map((item) => (
                        <TouchableOpacity
                            key={item.label}
                            style={styles.contactRow}
                            onPress={item.action}
                        >
                            <item.icon size={20} color={theme.colors.primary} />
                            <View>
                                <Text style={styles.contactLabel}>{item.label}</Text>
                                <Text style={styles.contactValue}>{item.value}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Heart size={16} color={theme.colors.error} fill={theme.colors.error} />
                    <Text style={styles.footerText}>Hecho con amor por los voluntarios de FEVADIS</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    scroll: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl },
    header: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
        paddingTop: theme.spacing.md,
    },
    logoCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
        ...theme.shadow.md,
    },
    logoText: { fontSize: 36, fontWeight: '800', color: '#fff' },
    orgName: { fontSize: 26, fontWeight: '800', color: theme.colors.text, letterSpacing: 1.5 },
    orgSub: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, marginTop: 4, textAlign: 'center' },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        ...theme.shadow.sm,
    },
    cardIcon: { fontSize: 28, marginBottom: theme.spacing.sm },
    cardTitle: { ...theme.typography.h3, color: theme.colors.text, marginBottom: 8 },
    cardContent: { ...theme.typography.body, color: theme.colors.textSecondary, lineHeight: 24 },
    section: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        gap: theme.spacing.md,
        ...theme.shadow.sm,
    },
    sectionTitle: { ...theme.typography.h3, color: theme.colors.text },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        paddingVertical: 4,
    },
    contactLabel: { ...theme.typography.caption, color: theme.colors.textSecondary },
    contactValue: { ...theme.typography.body, color: theme.colors.primary, fontWeight: '600' },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginTop: theme.spacing.md,
    },
    footerText: { ...theme.typography.caption, color: theme.colors.textSecondary },
});
