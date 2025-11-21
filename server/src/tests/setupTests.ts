// Central Jest setup for server tests
import { resetRuns, resetScenarios, getRun as _getRun, mockRunRepo, mockScenarioRepo as _mockScenarioRepo } from './mocks/mockRepos';
import type { Document } from 'mongoose';

// Reset in-memory mock stores before each test
beforeEach(() => {
  resetRuns();
  resetScenarios();
});

// Slightly longer default timeout for async lifecycle polling
jest.setTimeout(10000);

// Helper accessors for tests to inspect the in-memory stores
export async function getRun(id: string) {
  // prefer repo accessor if available
  if (mockRunRepo && typeof mockRunRepo.findById === 'function') {
    return mockRunRepo.findById(id);
  }
  // fallback to direct getter
  return _getRun(id);
}

export async function getAllRuns() {
  if (mockRunRepo && typeof mockRunRepo.findAll === 'function') {
    return mockRunRepo.findAll();
  }
  return [];
}

export async function getScenario(id: string) {
  if (_mockScenarioRepo && typeof _mockScenarioRepo.findById === 'function') {
    return _mockScenarioRepo.findById(id);
  }
  return null;
}

export {};
