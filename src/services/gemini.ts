/* GEMINI INTEGRATION - COMMENTED OUT
 * Backend API will be used instead
import { Analysis, ElectricalComponent, SymbolMatch } from '../types/analysis';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

const PRICING_GUIDE = `
Assign unit prices in Ghana Cedi (₵) based on component type:
- lighting: ₵2,325
- socket: ₵47 (standard), use socket type for all outlets
- hvac: ₵38,750
- motor: ₵12,400
- appliance: ₵9,300
- emergency_exit: ₵1,550
- fire_alarm: ₵775
- data_outlet: ₵93
- telephone: ₵62
- tv_outlet: ₵78
- exhaust_fan: ₵1,163
- distribution_board: ₵7,750
- meter: ₵3,875
- other: ₵500
`;

export async function analyzeBlueprint(
  fileData: string,
  fileType: string,
  onProgress: (step: string, progress: number) => void
): Promise<Analysis> {
  onProgress('Initializing analysis...', 10);

  const prompt = `Analyze this electrical blueprint/drawing and provide a detailed technical analysis following this exact structure.

This document should contain both a legend (symbol reference) and a floor plan.

INSTRUCTIONS:
1. First, identify the legend section showing electrical symbols and their meanings
2. Then identify the floor plan section showing the electrical layout
3. For each unique symbol in the legend, count how many times it appears in the floor plan
4. Map each symbol to an appropriate electrical component type

${PRICING_GUIDE}

You must respond in valid JSON format only. Follow these steps precisely:

1. Identify the building type (residential, industrial, or commercial)
2. Analyze the legend to identify all electrical symbols
3. Count symbol occurrences in the floor plan
4. List all electrical components with their ratings, quantities, and prices
5. Calculate Total Connected Load (TCL)
6. Apply appropriate diversity factors based on building type
7. Calculate Maximum Demand (MD)
8. Determine N+1 and N+2 redundancy requirements
9. Check compliance with Ghana Energy Commission GS1009 standards
10. Recommend power sourcing mix (Grid/Solar/Battery/Generator)

Respond with this exact JSON structure:
{
  "buildingType": "residential|industrial|commercial",
  "symbolMatches": [
    {
      "id": "unique-id",
      "name": "component name from legend",
      "count": number of occurrences in floor plan,
      "unitPrice": price in GHS,
      "totalPrice": count * unitPrice,
      "rating": power_rating_in_kw,
      "type": "lighting|socket|hvac|motor|appliance|emergency_exit|fire_alarm|data_outlet|telephone|tv_outlet|exhaust_fan|distribution_board|meter|other"
    }
  ],
  "components": [
    {
      "id": "unique-id",
      "name": "component name",
      "type": "lighting|socket|hvac|motor|appliance|emergency_exit|fire_alarm|data_outlet|telephone|tv_outlet|exhaust_fan|distribution_board|meter|other",
      "rating": power_rating_in_kw,
      "quantity": number,
      "totalLoad": rating * quantity,
      "unitPrice": price in GHS,
      "totalPrice": quantity * unitPrice
    }
  ],
  "calculationSteps": [
    {
      "step": 1,
      "title": "Step Title",
      "description": "Detailed explanation",
      "value": "calculated value or number",
      "formula": "formula used"
    }
  ],
  "loadCalculation": {
    "tcl": total_connected_load,
    "diversityFactor": 0.0-1.0,
    "md": maximum_demand,
    "redundancy": {
      "n1": n_plus_one_value,
      "n2": n_plus_two_value
    },
    "totalComponentCost": sum of all component total prices
  },
  "complianceChecks": [
    {
      "standard": "GS1009 Section X",
      "passed": true|false,
      "notes": "Explanation"
    }
  ],
  "recommendations": [
    {
      "type": "grid|solar|battery|generator",
      "percentage": 0-100,
      "capacity": "e.g., 50 kVA",
      "reasoning": "Why this recommendation"
    }
  ],
  "summary": "Brief technical summary of the analysis"
}

Important:
- Use standard Ghana electrical standards
- Apply residential diversity factor of 0.6-0.8
- Apply commercial diversity factor of 0.7-0.9
- Apply industrial diversity factor of 0.5-0.7
- All loads in kW
- All prices in Ghana Cedi (₵)
- Ensure all calculations are mathematically correct
- Provide 3-5 calculation steps showing your reasoning`;

  try {
    onProgress('Uploading document to AI...', 20);

    const base64Data = fileData.split(',')[1] || fileData;

    const requestBody = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: fileType,
              data: base64Data
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
        responseMimeType: "application/json"
      }
    };

    onProgress('AI is analyzing legend symbols...', 30);

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Analysis failed');
    }

    onProgress('Counting symbols in floor plan...', 50);

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      throw new Error('No analysis results received');
    }

    let parsedData;
    try {
      parsedData = JSON.parse(textContent);
    } catch {
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid response format from AI');
      }
    }

    onProgress('Finalizing analysis...', 90);

    const totalComponentCost = (parsedData.components || []).reduce(
      (sum: number, c: ElectricalComponent) => sum + (c.totalPrice || 0), 
      0
    );

    const analysis: Analysis = {
      id: Date.now().toString(),
      fileName: 'blueprint',
      fileType: fileType,
      fileData: fileData,
      timestamp: Date.now(),
      buildingType: parsedData.buildingType || 'commercial',
      calculationSteps: parsedData.calculationSteps || [],
      loadCalculation: {
        ...parsedData.loadCalculation,
        components: parsedData.components || [],
        totalComponentCost: totalComponentCost
      },
      complianceChecks: parsedData.complianceChecks || [],
      recommendations: parsedData.recommendations || [],
      summary: parsedData.summary || 'Analysis completed',
      symbolMatches: parsedData.symbolMatches || []
    };

    onProgress('Analysis complete!', 100);
    return analysis;

  } catch (error) {
    console.error('Analysis error:', error);
    throw error;
  }
}

export async function analyzeDualImages(
  legendData: string,
  floorPlanData: string,
  legendType: string,
  floorPlanType: string,
  onProgress: (step: string, progress: number) => void
): Promise<Analysis> {
  onProgress('Initializing dual image analysis...', 10);

  const prompt = `Analyze these two electrical images and provide a detailed technical analysis.

IMAGE 1 (LEGEND): Contains electrical symbol reference chart
IMAGE 2 (FLOOR PLAN): Contains electrical layout drawing

INSTRUCTIONS:
1. First, analyze the LEGEND image to identify all electrical symbols and their meanings
2. Then scan the FLOOR PLAN image to count how many times each symbol from the legend appears
3. For each symbol found in both images, record:
   - The symbol name/description from the legend
   - The count of occurrences in the floor plan
   - The appropriate electrical component type
   - Estimated power rating
   - Unit price in Ghana Cedi

${PRICING_GUIDE}

You must respond in valid JSON format only. Follow these steps precisely:

1. Identify the building type (residential, industrial, or commercial) from the floor plan
2. List all symbols found in the legend with their floor plan counts
3. Map symbols to electrical components with ratings and quantities
4. Calculate Total Connected Load (TCL)
5. Apply appropriate diversity factors based on building type
6. Calculate Maximum Demand (MD)
7. Determine N+1 and N+2 redundancy requirements
8. Check compliance with Ghana Energy Commission GS1009 standards
9. Recommend power sourcing mix (Grid/Solar/Battery/Generator)

Respond with this exact JSON structure:
{
  "buildingType": "residential|industrial|commercial",
  "symbolMatches": [
    {
      "id": "unique-id",
      "name": "component name from legend",
      "count": number of occurrences in floor plan,
      "unitPrice": price in GHS,
      "totalPrice": count * unitPrice,
      "rating": power_rating_in_kw,
      "type": "lighting|socket|hvac|motor|appliance|emergency_exit|fire_alarm|data_outlet|telephone|tv_outlet|exhaust_fan|distribution_board|meter|other"
    }
  ],
  "components": [
    {
      "id": "unique-id",
      "name": "component name",
      "type": "lighting|socket|hvac|motor|appliance|emergency_exit|fire_alarm|data_outlet|telephone|tv_outlet|exhaust_fan|distribution_board|meter|other",
      "rating": power_rating_in_kw,
      "quantity": number,
      "totalLoad": rating * quantity,
      "unitPrice": price in GHS,
      "totalPrice": quantity * unitPrice
    }
  ],
  "calculationSteps": [
    {
      "step": 1,
      "title": "Step Title",
      "description": "Detailed explanation",
      "value": "calculated value or number",
      "formula": "formula used"
    }
  ],
  "loadCalculation": {
    "tcl": total_connected_load,
    "diversityFactor": 0.0-1.0,
    "md": maximum_demand,
    "redundancy": {
      "n1": n_plus_one_value,
      "n2": n_plus_two_value
    },
    "totalComponentCost": sum of all component total prices
  },
  "complianceChecks": [
    {
      "standard": "GS1009 Section X",
      "passed": true|false,
      "notes": "Explanation"
    }
  ],
  "recommendations": [
    {
      "type": "grid|solar|battery|generator",
      "percentage": 0-100,
      "capacity": "e.g., 50 kVA",
      "reasoning": "Why this recommendation"
    }
  ],
  "summary": "Brief technical summary of the analysis"
}

Important:
- Use standard Ghana electrical standards
- Apply residential diversity factor of 0.6-0.8
- Apply commercial diversity factor of 0.7-0.9
- Apply industrial diversity factor of 0.5-0.7
- All loads in kW
- All prices in Ghana Cedi (₵)
- Ensure all calculations are mathematically correct
- Provide 3-5 calculation steps showing your reasoning`;

  try {
    onProgress('Uploading images to AI...', 20);

    const legendBase64 = legendData.split(',')[1] || legendData;
    const floorPlanBase64 = floorPlanData.split(',')[1] || floorPlanData;

    const requestBody = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: legendType,
              data: legendBase64
            }
          },
          {
            inline_data: {
              mime_type: floorPlanType,
              data: floorPlanBase64
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
        responseMimeType: "application/json"
      }
    };

    onProgress('AI is analyzing legend symbols...', 30);

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Analysis failed');
    }

    onProgress('Counting symbols in floor plan...', 50);

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      throw new Error('No analysis results received');
    }

    let parsedData;
    try {
      parsedData = JSON.parse(textContent);
    } catch {
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid response format from AI');
      }
    }

    onProgress('Finalizing analysis...', 90);

    const totalComponentCost = (parsedData.components || []).reduce(
      (sum: number, c: ElectricalComponent) => sum + (c.totalPrice || 0), 
      0
    );

    const analysis: Analysis = {
      id: Date.now().toString(),
      fileName: 'dual-analysis',
      fileType: 'image/png',
      fileData: floorPlanData,
      legendFile: {
        name: 'legend.png',
        type: legendType,
        data: legendData
      },
      floorPlanFile: {
        name: 'floor-plan.png',
        type: floorPlanType,
        data: floorPlanData
      },
      timestamp: Date.now(),
      buildingType: parsedData.buildingType || 'commercial',
      calculationSteps: parsedData.calculationSteps || [],
      loadCalculation: {
        ...parsedData.loadCalculation,
        components: parsedData.components || [],
        totalComponentCost: totalComponentCost
      },
      complianceChecks: parsedData.complianceChecks || [],
      recommendations: parsedData.recommendations || [],
      summary: parsedData.summary || 'Analysis completed',
      symbolMatches: parsedData.symbolMatches || []
    };

    onProgress('Analysis complete!', 100);
    return analysis;

  } catch (error) {
    console.error('Analysis error:', error);
    throw error;
  }
}

export function generateMockAnalysis(): Analysis {
  const components: ElectricalComponent[] = [
    { 
      id: '1', 
      name: 'LED Panel Light', 
      type: 'lighting', 
      rating: 0.04, 
      quantity: 45, 
      totalLoad: 1.8,
      unitPrice: 2325,
      totalPrice: 104625
    },
    { 
      id: '2', 
      name: 'Standard Socket Outlet', 
      type: 'socket', 
      rating: 0.5, 
      quantity: 32, 
      totalLoad: 16,
      unitPrice: 47,
      totalPrice: 1504
    },
    { 
      id: '3', 
      name: 'Air Conditioning Unit', 
      type: 'hvac', 
      rating: 3.5, 
      quantity: 4, 
      totalLoad: 14,
      unitPrice: 23250,
      totalPrice: 93000
    },
    { 
      id: '4', 
      name: 'Emergency Exit Light', 
      type: 'emergency_exit', 
      rating: 0.02, 
      quantity: 8, 
      totalLoad: 0.16,
      unitPrice: 1550,
      totalPrice: 12400
    },
    { 
      id: '5', 
      name: 'Fire Alarm Detector', 
      type: 'fire_alarm', 
      rating: 0.01, 
      quantity: 12, 
      totalLoad: 0.12,
      unitPrice: 775,
      totalPrice: 9300
    },
    { 
      id: '6', 
      name: 'Data/Network Outlet', 
      type: 'data_outlet', 
      rating: 0.005, 
      quantity: 24, 
      totalLoad: 0.12,
      unitPrice: 93,
      totalPrice: 2232
    }
  ];

  const symbolMatches: SymbolMatch[] = [
    { id: 's1', name: 'Ceiling Light Symbol', count: 45, unitPrice: 2325, totalPrice: 104625, rating: 0.04, type: 'lighting' },
    { id: 's2', name: 'Wall Socket Symbol', count: 32, unitPrice: 47, totalPrice: 1504, rating: 0.5, type: 'socket' },
    { id: 's3', name: 'AC Unit Symbol', count: 4, unitPrice: 23250, totalPrice: 93000, rating: 3.5, type: 'hvac' },
    { id: 's4', name: 'Emergency Light Symbol', count: 8, unitPrice: 1550, totalPrice: 12400, rating: 0.02, type: 'emergency_exit' },
    { id: 's5', name: 'Fire Detector Symbol', count: 12, unitPrice: 775, totalPrice: 9300, rating: 0.01, type: 'fire_alarm' },
    { id: 's6', name: 'Data Point Symbol', count: 24, unitPrice: 93, totalPrice: 2232, rating: 0.005, type: 'data_outlet' }
  ];

  const tcl = components.reduce((sum, c) => sum + c.totalLoad, 0);
  const diversityFactor = 0.7;
  const md = tcl * diversityFactor;
  const totalComponentCost = components.reduce((sum, c) => sum + c.totalPrice, 0);

  return {
    id: Date.now().toString(),
    fileName: 'sample-blueprint.pdf',
    fileType: 'application/pdf',
    fileData: '',
    timestamp: Date.now(),
    buildingType: 'commercial',
    calculationSteps: [
      { step: 1, title: 'Legend Analysis', description: 'Identified 6 electrical symbol types from legend', value: '6 symbols', formula: 'N/A' },
      { step: 2, title: 'Symbol Counting', description: 'Counted symbols in floor plan', value: '125 total', formula: 'Sum of all symbols' },
      { step: 3, title: 'Component Pricing', description: 'Assigned Ghana Cedi prices to components', value: `₵${totalComponentCost.toLocaleString()}`, formula: 'Sum(count × unitPrice)' },
      { step: 4, title: 'Total Connected Load', description: 'Sum of all component loads', value: `${tcl.toFixed(2)} kW`, formula: 'TCL = Σ(Rating × Quantity)' },
      { step: 5, title: 'Maximum Demand', description: 'Calculated peak demand with diversity', value: `${md.toFixed(2)} kW`, formula: 'MD = TCL × Diversity Factor' }
    ],
    loadCalculation: {
      components,
      tcl,
      diversityFactor,
      md,
      redundancy: {
        n1: md * 1.2,
        n2: md * 1.4
      },
      totalComponentCost
    },
    complianceChecks: [
      { standard: 'GS1009 - Load Calculations', passed: true, notes: 'Diversity factors applied correctly' },
      { standard: 'GS1009 - Safety Margins', passed: true, notes: 'N+1 redundancy recommended' },
      { standard: 'GS1009 - Emergency Lighting', passed: true, notes: '8 emergency exit lights provided' },
      { standard: 'GS1009 - Fire Safety', passed: true, notes: '12 fire alarm detectors installed' }
    ],
    recommendations: [
      { type: 'grid', percentage: 60, capacity: '25 kVA', reasoning: 'Primary power source for base load' },
      { type: 'solar', percentage: 30, capacity: '15 kWp', reasoning: 'Daytime peak shaving and cost reduction' },
      { type: 'battery', percentage: 10, capacity: '50 kWh', reasoning: 'Backup for critical loads' }
    ],
    summary: `Analysis of ${components.length} electrical component categories shows a total connected load of ${tcl.toFixed(2)} kW with a maximum demand of ${md.toFixed(2)} kW. Total component cost is ₵${totalComponentCost.toLocaleString()}. The system is GS1009 compliant with recommended N+1 redundancy.`,
    symbolMatches
  };
}

END OF GEMINI INTEGRATION COMMENT BLOCK */
