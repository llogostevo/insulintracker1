"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle } from "lucide-react"

type MealType = "breakfast" | "lunch" | "tea"

const DOSE_TABLE = {
  breakfast: [14, 16, 18, 20, 22, 24],
  lunch: [8, 10, 12, 14, 16, 18],
  tea: [6, 8, 10, 12, 14, 16],
}

const GLUCOSE_RANGES = ["Under 9", "9 to 11.9", "12 to 14.9", "15 to 17.9", "18 to 20.9", "21 and above"]

const GLUCOSE_THRESHOLDS = [9, 12, 15, 18, 21]
const HYPO_THRESHOLD = 4.2
const KETOACIDOSIS_THRESHOLD = 22

function getDoseIndex(glucose: number): number {
  for (let i = 0; i < GLUCOSE_THRESHOLDS.length; i++) {
    if (glucose < GLUCOSE_THRESHOLDS[i]) return i
  }
  return 5 // For 21+
}

export default function InsulinCalculator() {
  const [step, setStep] = useState<"meal" | "glucose" | "result">("meal")
  const [mealType, setMealType] = useState<MealType | null>(null)
  const [glucoseLevel, setGlucoseLevel] = useState(5.5)

  const calculateDose = () => {
    if (!mealType) return null
    const doseIndex = getDoseIndex(glucoseLevel)
    return DOSE_TABLE[mealType][doseIndex]
  }

  const isHypo = glucoseLevel < HYPO_THRESHOLD
  const isKetoacidosisRisk = glucoseLevel > KETOACIDOSIS_THRESHOLD

  const resetCalculator = () => {
    setStep("meal")
    setMealType(null)
    setGlucoseLevel(5.5)
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Medical Disclaimer</AlertTitle>
        <AlertDescription>
          This calculator is for educational purposes only. Always consult with your healthcare provider about your
          specific insulin needs and follow their medical advice.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-[1fr,380px]">
        <Card className="order-2 md:order-1">
          <CardHeader>
            <CardTitle>Dosage Reference Table</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[120px]" rowSpan={2}>
                    Meal Time
                  </TableHead>
                  <TableHead className="text-center font-bold bg-muted" colSpan={6}>
                    Glucose Level (mmol/L)
                  </TableHead>
                </TableRow>
                <TableRow>
                  {GLUCOSE_RANGES.map((range, i) => (
                    <TableHead key={i} className="text-center h-16 align-middle">
                      {range}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="bg-orange-50/50 hover:bg-orange-50">
                  <TableCell className="font-medium">Breakfast</TableCell>
                  {DOSE_TABLE.breakfast.map((dose, i) => (
                    <TableCell key={i} className="text-center font-bold text-lg">
                      {dose}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow className="bg-orange-50/30 hover:bg-orange-50">
                  <TableCell className="font-medium">Lunch</TableCell>
                  {DOSE_TABLE.lunch.map((dose, i) => (
                    <TableCell key={i} className="text-center font-bold text-lg">
                      {dose}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow className="bg-orange-50/50 hover:bg-orange-50">
                  <TableCell className="font-medium">Tea Time</TableCell>
                  {DOSE_TABLE.tea.map((dose, i) => (
                    <TableCell key={i} className="text-center font-bold text-lg">
                      {dose}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
            <p className="text-sm text-muted-foreground mt-4">
              All values shown are units of fast-acting insulin (Orange Pen). At breakfast, also give 30 units of
              long-acting insulin (Green Pen).
            </p>
          </CardContent>
        </Card>

        <Card className="order-1 md:order-2">
          <CardHeader>
            <CardTitle>Insulin Calculator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === "meal" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Select Meal</h3>
                <div className="grid grid-cols-1 gap-4">
                  {(["breakfast", "lunch", "tea"] as const).map((type) => (
                    <Button
                      key={type}
                      variant="outline"
                      size="lg"
                      className="h-20 text-xl"
                      onClick={() => {
                        setMealType(type)
                        setStep("glucose")
                      }}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {step === "glucose" && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Blood Glucose (mmol/L)</h3>
                  <Slider
                    value={[glucoseLevel]}
                    onValueChange={([value]) => setGlucoseLevel(value)}
                    min={1}
                    max={33}
                    step={0.1}
                    className="py-4"
                  />
                  <div className="text-center text-3xl font-bold">{glucoseLevel.toFixed(1)}</div>
                </div>

                {isHypo ? (
                  <div className="space-y-4">
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Low Blood Sugar - Treat Immediately</AlertTitle>
                      <AlertDescription className="mt-2 space-y-2">
                        <p>1. Take 2 sips of orange juice</p>
                        <p>2. Wait 5 minutes</p>
                        <p>3. Repeat if necessary</p>
                        <p className="font-medium">
                          Only proceed with insulin when glucose is above 4.2, then eat immediately after dosing.
                        </p>
                      </AlertDescription>
                    </Alert>
                    <Button variant="outline" size="lg" className="w-full" onClick={resetCalculator}>
                      Start Over
                    </Button>
                  </div>
                ) : (
                  <Button size="lg" className="w-full h-20 text-xl" onClick={() => setStep("result")}>
                    Calculate Dose
                  </Button>
                )}
              </div>
            )}

            {step === "result" && mealType && (
              <div className="space-y-4">
                <div className="text-lg font-medium text-center mb-2">
                  Blood Glucose: {glucoseLevel.toFixed(1)} mmol/L
                </div>

                {isKetoacidosisRisk && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>High Blood Sugar - Risk of Ketoacidosis</AlertTitle>
                    <AlertDescription className="mt-2 space-y-2">
                      <p>1. Deliver insulin as per dosage plan</p>
                      <p>2. Perform a ketone test</p>
                      <p>3. Wait 15 minutes before eating</p>
                      <p>4. Monitor glucose levels over next 2 hours</p>
                      <p className="font-medium">Ensure glucose returns to normal levels</p>
                    </AlertDescription>
                  </Alert>
                )}

                {mealType === "breakfast" && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800 mb-2">Long Acting (Green Pen) - Give First</p>
                    <p className="text-3xl font-bold text-green-700">30 units</p>
                  </div>
                )}

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm font-medium text-orange-800 mb-2">Fast Acting (Orange Pen)</p>
                  <p className="text-3xl font-bold text-orange-700">{calculateDose()} units</p>
                </div>

                {!isKetoacidosisRisk && (
                  <p className="text-sm text-muted-foreground">Take insulin and eat straight away</p>
                )}

                <Button variant="outline" size="lg" className="w-full" onClick={resetCalculator}>
                  Start Over
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

