import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildQuoteXrayQuestions,
  getQuoteXrayFixture,
  summarizeQuoteXray,
} from './quote-xray.ts'

test('basement fixture exposes electrical cost and non-priced scope risk', () => {
  const state = getQuoteXrayFixture('basement-traditional')
  const summary = summarizeQuoteXray(state)

  assert.equal(summary.quotedTotal, 18_500)
  assert.equal(summary.pricedExposureLow, 600)
  assert.equal(summary.pricedExposureHigh, 5_200)
  assert.equal(summary.projectedHigh, 23_700)
  assert.ok(summary.unpricedRiskCount >= 2)
  assert.ok(summary.findings.some((finding) => finding.scopeId === 'electrical'))
})

test('generated questions only cover unresolved applicable scope', () => {
  const state = getQuoteXrayFixture('plug-in-infrared')
  const questions = buildQuoteXrayQuestions(state)

  assert.equal(questions.length, 1)
  assert.match(questions[0], /warranty/i)
})

test('resolving scope changes both completeness and exposure', () => {
  const state = getQuoteXrayFixture('backyard-barrel')
  const before = summarizeQuoteXray(state)
  assert.ok(before.benchmark)
  assert.match(before.benchmark.label, /your size/)
  state.scope.electrical = { status: 'included' }
  state.scope.foundation = { status: 'included' }
  state.scope.permit = { status: 'included' }
  state.scope.panel = { status: 'not_applicable' }
  const after = summarizeQuoteXray(state)

  assert.ok(after.completeness > before.completeness)
  assert.ok(after.pricedExposureHigh < before.pricedExposureHigh)
})
