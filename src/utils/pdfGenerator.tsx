import React from 'react';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Analysis } from '../types/analysis';
import { formatLoad } from '../utils/calculations';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    backgroundColor: '#1a1a1a',
  },
  header: {
    backgroundColor: '#ff4500',
    padding: 20,
    margin: -30,
    marginBottom: 20,
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtext: {
    color: '#ffaa80',
    fontSize: 12,
    marginTop: 5,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff4500',
    marginBottom: 8,
    borderBottom: '1 solid #ff4500',
    paddingBottom: 4,
  },
  text: {
    fontSize: 10,
    marginBottom: 4,
    color: '#a0a0a0',
  },
  label: {
    fontWeight: 'bold',
    color: 'white',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridItem: {
    width: '48%',
    backgroundColor: '#2a2a2a',
    padding: 10,
    borderRadius: 4,
    border: '1 solid #333333',
  },
  gridLabel: {
    fontSize: 9,
    color: '#a0a0a0',
    marginBottom: 2,
  },
  gridValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff4500',
  },
  table: {
    width: '100%',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #333333',
    paddingVertical: 6,
  },
  tableHeader: {
    backgroundColor: '#ff4500',
    color: 'white',
    fontWeight: 'bold',
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
    color: '#a0a0a0',
  },
  complianceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkmark: {
    color: '#ff4500',
    marginRight: 6,
  },
  recommendation: {
    backgroundColor: '#2a2a2a',
    padding: 10,
    borderRadius: 4,
    marginBottom: 8,
    borderLeft: '3 solid #ff4500',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#666666',
  },
  priceCell: {
    flex: 1,
    fontSize: 9,
    textAlign: 'right',
    color: '#a0a0a0',
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#2a2a2a',
    padding: 10,
    marginTop: 10,
    borderTop: '2 solid #ff4500',
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff4500',
  },
});

interface AnalysisPDFProps {
  analysis: Analysis;
}

const AnalysisPDF: React.FC<AnalysisPDFProps> = ({ analysis }) => {
  const date = new Date(analysis.timestamp).toLocaleDateString('en-GH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>PowerLit</Text>
          <Text style={styles.headerSubtext}>Electrical Load Analysis Report</Text>
        </View>

        {/* File Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Document Information</Text>
          <Text style={styles.text}>
            <Text style={styles.label}>File Name: </Text>
            {analysis.fileName}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.label}>Analysis Date: </Text>
            {date}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.label}>Building Type: </Text>
            {analysis.buildingType.charAt(0).toUpperCase() + analysis.buildingType.slice(1)}
          </Text>
        </View>

        {/* Load Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Load Summary</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Total Connected Load</Text>
              <Text style={styles.gridValue}>{formatLoad(analysis.loadCalculation.tcl)}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Maximum Demand</Text>
              <Text style={styles.gridValue}>{formatLoad(analysis.loadCalculation.md)}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Diversity Factor</Text>
              <Text style={styles.gridValue}>{(analysis.loadCalculation.diversityFactor * 100).toFixed(0)}%</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Components Identified</Text>
              <Text style={styles.gridValue}>{analysis.loadCalculation.components?.length ?? 0}</Text>
            </View>
          </View>
        </View>

        {/* Symbol Detection & Pricing */}
        {(analysis.symbolMatches || []).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Symbol Detection & Component Pricing</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, { flex: 2 }]}>Component</Text>
                <Text style={styles.tableCell}>Type</Text>
                <Text style={[styles.tableCell, { textAlign: 'center' }]}>Count</Text>
                <Text style={[styles.priceCell, { flex: 1.2 }]}>Unit Price</Text>
                <Text style={[styles.priceCell, { flex: 1.2 }]}>Total</Text>
              </View>
              {(analysis.symbolMatches || []).map((match) => (
                <View key={match.id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{match.name}</Text>
                  <Text style={styles.tableCell}>{match.type}</Text>
                  <Text style={[styles.tableCell, { textAlign: 'center' }]}>{match.count}</Text>
                  <Text style={[styles.priceCell, { flex: 1.2 }]}>GHS {match.unitPrice.toLocaleString()}</Text>
                  <Text style={[styles.priceCell, { flex: 1.2 }]}>GHS {match.totalPrice.toLocaleString()}</Text>
                </View>
              ))}
            </View>
            <View style={styles.grandTotal}>
              <Text style={styles.grandTotalLabel}>Grand Total:</Text>
              <Text style={styles.grandTotalValue}>
                GHS {(analysis.symbolMatches || []).reduce((sum, m) => sum + m.totalPrice, 0).toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        {/* Components */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Electrical Components - Load Analysis</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { flex: 2 }]}>Component</Text>
              <Text style={styles.tableCell}>Type</Text>
              <Text style={styles.tableCell}>Rating</Text>
              <Text style={styles.tableCell}>Qty</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Total Load</Text>
              <Text style={[styles.priceCell, { flex: 1.2 }]}>Price</Text>
            </View>
            {(analysis.loadCalculation.components || []).map((component) => (
              <View key={component.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>{component.name}</Text>
                <Text style={styles.tableCell}>{component.type}</Text>
                <Text style={styles.tableCell}>{component.rating} kW</Text>
                <Text style={styles.tableCell}>{component.quantity}</Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>{formatLoad(component.totalLoad)}</Text>
                <Text style={[styles.priceCell, { flex: 1.2 }]}>GHS {(component.totalPrice || 0).toLocaleString()}</Text>
              </View>
            ))}
          </View>
          {analysis.loadCalculation.totalComponentCost > 0 && (
            <View style={styles.grandTotal}>
              <Text style={styles.grandTotalLabel}>Total Component Cost:</Text>
              <Text style={styles.grandTotalValue}>
                GHS {analysis.loadCalculation.totalComponentCost.toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        {/* Redundancy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Redundancy Requirements</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>N+1 Requirement</Text>
              <Text style={styles.gridValue}>{formatLoad(analysis.loadCalculation.redundancy.n1)}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>N+2 Requirement</Text>
              <Text style={styles.gridValue}>{formatLoad(analysis.loadCalculation.redundancy.n2)}</Text>
            </View>
          </View>
        </View>

        {/* Compliance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GS1009 Compliance Audit</Text>
          {analysis.complianceChecks.map((check, index) => (
            <View key={index} style={styles.complianceItem}>
              <Text style={styles.checkmark}>{check.passed ? '✓' : '✗'}</Text>
              <Text style={[styles.text, { flex: 1 }]}>
                <Text style={styles.label}>{check.standard}: </Text>
                {check.notes}
              </Text>
            </View>
          ))}
        </View>

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Power Sourcing Recommendations</Text>
          {analysis.recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendation}>
              <Text style={[styles.text, styles.label]}>
                {rec.type.charAt(0).toUpperCase() + rec.type.slice(1)} ({rec.percentage}%)
              </Text>
              <Text style={styles.text}>Capacity: {rec.capacity}</Text>
              <Text style={styles.text}>{rec.reasoning}</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <Text style={styles.text}>{analysis.summary}</Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by PowerLit - Ghana Energy Commission Compliant Analysis
        </Text>
      </Page>
    </Document>
  );
};

interface PDFExportButtonProps {
  analysis: Analysis;
}

export const PDFExportButton: React.FC<PDFExportButtonProps> = ({ analysis }) => {
  return (
    <PDFDownloadLink
      document={<AnalysisPDF analysis={analysis} />}
      fileName={`powerlit-analysis-${analysis.id}.pdf`}
      className="bg-[#ff4500] text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-[#ff5722] transition-all-smooth shadow-lg shadow-[#ff4500]/25"
    >
      {({ loading }) => (loading ? 'Generating PDF...' : 'Download PDF Report')}
    </PDFDownloadLink>
  );
};
