import { Analysis, ElectricalComponent, SymbolMatch, CalculationStep, ComplianceCheck, PowerRecommendation } from '../types/analysis';
import { api, BackendAnalysisResponse, BackendBatchResponse } from './api';

// Map backend component type to frontend types
function mapComponentType(name: string): ElectricalComponent['type'] {
  const nameLower = name.toLowerCase();
  if (nameLower.includes('light') || nameLower.includes('lamp')) return 'lighting';
  if (nameLower.includes('socket') || nameLower.includes('outlet')) return 'socket';
  if (nameLower.includes('hvac') || nameLower.includes('ac') || nameLower.includes('air')) return 'hvac';
  if (nameLower.includes('motor')) return 'motor';
  if (nameLower.includes('appliance')) return 'appliance';
  if (nameLower.includes('emergency') || nameLower.includes('exit')) return 'emergency_exit';
  if (nameLower.includes('fire') || nameLower.includes('alarm')) return 'fire_alarm';
  if (nameLower.includes('data') || nameLower.includes('network')) return 'data_outlet';
  if (nameLower.includes('telephone') || nameLower.includes('phone')) return 'telephone';
  if (nameLower.includes('tv') || nameLower.includes('television')) return 'tv_outlet';
  if (nameLower.includes('exhaust') || nameLower.includes('fan')) return 'exhaust_fan';
  if (nameLower.includes('distribution') || nameLower.includes('panel') || nameLower.includes('board')) return 'distribution_board';
  if (nameLower.includes('meter')) return 'meter';
  return 'other';
}

// Transform backend response to frontend Analysis type
export function transformBackendResponse(
  backendData: BackendAnalysisResponse,
  blueprintFile: File,
  legendFile: File | null,
  blueprintFileData: string,
  legendFileData: string | null
): Analysis {
  // Transform inventory to components
  const components: ElectricalComponent[] = backendData.inventory.map((item, index) => {
    const type = mapComponentType(item.name);
    const rating = item.rating_watts / 1000; // Convert watts to kW
    const totalLoad = item.total_watts / 1000;
    
    // Estimate unit price based on type (simplified pricing)
    const unitPrices: Record<ElectricalComponent['type'], number> = {
      lighting: 2325,
      socket: 47,
      hvac: 38750,
      motor: 12400,
      appliance: 9300,
      emergency_exit: 1550,
      fire_alarm: 775,
      data_outlet: 93,
      telephone: 62,
      tv_outlet: 78,
      exhaust_fan: 1163,
      distribution_board: 7750,
      meter: 3875,
      other: 500
    };
    
    const unitPrice = unitPrices[type] || 500;
    const totalPrice = unitPrice * item.quantity;
    
    return {
      id: `comp-${index}`,
      name: item.name,
      type,
      rating,
      quantity: item.quantity,
      totalLoad,
      unitPrice,
      totalPrice
    };
  });

  // Create symbol matches from components (backend doesn't provide symbol matches directly)
  const symbolMatches: SymbolMatch[] = components.map((comp, index) => ({
    id: `symbol-${index}`,
    name: comp.name,
    count: comp.quantity,
    unitPrice: comp.unitPrice,
    totalPrice: comp.totalPrice,
    rating: comp.rating,
    type: comp.type
  }));

  // Transform calculations
  const calc = backendData.calculations;
  const totalComponentCost = components.reduce((sum, c) => sum + c.totalPrice, 0);

  // Generate calculation steps
  const calculationSteps: CalculationStep[] = [
    {
      step: 1,
      title: 'Component Inventory',
      description: `Identified ${components.length} electrical components from the blueprint`,
      value: `${components.length} components`,
      formula: 'N/A'
    },
    {
      step: 2,
      title: 'Total Connected Load',
      description: 'Sum of all component power ratings',
      value: `${calc.total_connected_load.toFixed(2)} W`,
      formula: 'TCL = Σ(Rating × Quantity)'
    },
    {
      step: 3,
      title: 'Diversity Factor Applied',
      description: `Applied ${calc.building_type} diversity factor`,
      value: calc.diversity_factor.toFixed(2),
      formula: `DF = ${calc.diversity_factor}`
    },
    {
      step: 4,
      title: 'Maximum Demand',
      description: 'Peak power demand after diversity',
      value: `${calc.maximum_demand.toFixed(2)} W`,
      formula: 'MD = TCL × DF'
    },
    {
      step: 5,
      title: 'Processing Complete',
      description: `Analysis completed in ${backendData.processing_time_ms}ms`,
      value: `${(backendData.processing_time_ms / 1000).toFixed(2)}s`,
      formula: 'N/A'
    }
  ];

  // Transform compliance checks
  const complianceChecks: ComplianceCheck[] = backendData.compliance_audit.map((audit) => ({
    standard: audit.standard_clause,
    passed: audit.compliance_status === 'compliant',
    notes: audit.description
  }));

  // Transform recommendations
  const recommendations: PowerRecommendation[] = backendData.recommendations.map((rec) => ({
    type: rec.source === 'hybrid' ? 'grid' : rec.source, // Map hybrid to grid as fallback
    percentage: rec.percentage,
    capacity: `${rec.capacity_kw.toFixed(1)} kW`,
    reasoning: rec.reasoning
  }));

  const analysis: Analysis = {
    id: backendData.id || Date.now().toString(),
    fileName: backendData.file_name || blueprintFile.name,
    fileType: blueprintFile.type,
    fileData: blueprintFileData,
    timestamp: backendData.created_at ? new Date(backendData.created_at).getTime() : Date.now(),
    buildingType: calc.building_type,
    calculationSteps,
    loadCalculation: {
      components,
      tcl: calc.total_connected_load / 1000, // Convert to kW
      diversityFactor: calc.diversity_factor,
      md: calc.maximum_demand / 1000, // Convert to kW
      redundancy: {
        n1: (calc.maximum_demand / 1000) * 1.2,
        n2: (calc.maximum_demand / 1000) * 1.4
      },
      totalComponentCost
    },
    complianceChecks,
    recommendations,
    summary: `Analysis of ${components.length} electrical components shows a total connected load of ${(calc.total_connected_load / 1000).toFixed(2)} kW with a maximum demand of ${(calc.maximum_demand / 1000).toFixed(2)} kW. Total estimated component cost is ₵${totalComponentCost.toLocaleString()}. The system shows ${complianceChecks.filter(c => c.passed).length}/${complianceChecks.length} compliant standards.`,
    symbolMatches
  };

  // Add legend file if provided
  if (legendFile && legendFileData) {
    analysis.legendFile = {
      name: legendFile.name,
      type: legendFile.type,
      data: legendFileData
    };
  }

  return analysis;
}

// Analyze a single blueprint with optional legend file
export async function analyzeWithBackend(
  blueprintFile: File,
  legendFile: File | null,
  buildingType: 'residential' | 'commercial' | 'industrial' = 'commercial',
  projectName: string = '',
  onProgress: (step: string, progress: number, longRunning?: boolean) => void
): Promise<Analysis> {
  onProgress('Preparing files...', 10, false);

  // Store file data for later use
  const blueprintFileData = await fileToBase64(blueprintFile);
  const legendFileData = legendFile ? await fileToBase64(legendFile) : null;

  onProgress('Uploading to backend...', 30, false);

  try {
    onProgress('Analyzing blueprint...', 50, false);

    const backendData = await api.analysis.analyze(
      blueprintFile,
      legendFile,
      buildingType,
      projectName,
      (step, progress) => onProgress(step, progress, false)
    );

    onProgress('Processing results...', 80, false);

    const analysis = transformBackendResponse(
      backendData,
      blueprintFile,
      legendFile,
      blueprintFileData,
      legendFileData
    );

    onProgress('Analysis complete!', 100, false);

    return analysis;
  } catch (error) {
    console.error('Backend analysis error:', error);
    throw error;
  }
}

// Health check
export async function checkBackendHealth(): Promise<boolean> {
  return await api.health.checkHealth();
}

// Get diversity factors
export async function getDiversityFactors(): Promise<Record<string, number>> {
  return await api.analysis.getDiversityFactors();
}

// Batch analysis - analyze multiple files
export async function analyzeBatchWithBackend(
  files: File[],
  buildingType: 'residential' | 'commercial' | 'industrial' = 'commercial',
  projectName: string = '',
  onProgress: (step: string, progress: number, longRunning?: boolean) => void
): Promise<Analysis[]> {
  onProgress('Preparing files for batch analysis...', 10, false);

  // Store file data for later use
  const fileDataMap: Map<string, string> = new Map();

  for (const file of files) {
    const base64 = await fileToBase64(file);
    fileDataMap.set(file.name, base64);
  }

  onProgress('Uploading files to backend...', 30, false);

  try {
    onProgress('Analyzing blueprints in batch...', 50, false);

    const batchResponse: BackendBatchResponse = await api.analysis.analyzeBatch(
      files,
      buildingType,
      projectName,
      (step, progress) => onProgress(step, progress, false)
    );

    onProgress('Processing batch results...', 80, false);

    // Extract the analysis object from the batch response
    const analysisData = batchResponse.analysis;

    // Process each file - use blueprint_results to determine which files were processed
    const analyses = files.map((file) => {
      const fileData = fileDataMap.get(file.name) || '';

      return transformBackendResponse(
        analysisData,
        file,
        null,
        fileData,
        null
      );
    });

    onProgress('Batch analysis complete!', 100, false);

    return analyses;
  } catch (error) {
    console.error('Batch analysis error:', error);
    throw error;
  }
}

// Helper function to convert file to base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
