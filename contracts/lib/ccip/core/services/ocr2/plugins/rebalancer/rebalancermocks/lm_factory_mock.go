// Code generated by mockery v2.38.0. DO NOT EDIT.

package mocks

import (
	liquiditymanager "github.com/smartcontractkit/chainlink/v2/core/services/ocr2/plugins/rebalancer/liquiditymanager"
	mock "github.com/stretchr/testify/mock"

	models "github.com/smartcontractkit/chainlink/v2/core/services/ocr2/plugins/rebalancer/models"
)

// Factory is an autogenerated mock type for the Factory type
type Factory struct {
	mock.Mock
}

// GetRebalancer provides a mock function with given fields: networkID, address
func (_m *Factory) GetRebalancer(networkID models.NetworkSelector, address models.Address) (liquiditymanager.Rebalancer, error) {
	ret := _m.Called(networkID, address)

	if len(ret) == 0 {
		panic("no return value specified for GetRebalancer")
	}

	var r0 liquiditymanager.Rebalancer
	var r1 error
	if rf, ok := ret.Get(0).(func(models.NetworkSelector, models.Address) (liquiditymanager.Rebalancer, error)); ok {
		return rf(networkID, address)
	}
	if rf, ok := ret.Get(0).(func(models.NetworkSelector, models.Address) liquiditymanager.Rebalancer); ok {
		r0 = rf(networkID, address)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(liquiditymanager.Rebalancer)
		}
	}

	if rf, ok := ret.Get(1).(func(models.NetworkSelector, models.Address) error); ok {
		r1 = rf(networkID, address)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// NewRebalancer provides a mock function with given fields: networkID, address
func (_m *Factory) NewRebalancer(networkID models.NetworkSelector, address models.Address) (liquiditymanager.Rebalancer, error) {
	ret := _m.Called(networkID, address)

	if len(ret) == 0 {
		panic("no return value specified for NewRebalancer")
	}

	var r0 liquiditymanager.Rebalancer
	var r1 error
	if rf, ok := ret.Get(0).(func(models.NetworkSelector, models.Address) (liquiditymanager.Rebalancer, error)); ok {
		return rf(networkID, address)
	}
	if rf, ok := ret.Get(0).(func(models.NetworkSelector, models.Address) liquiditymanager.Rebalancer); ok {
		r0 = rf(networkID, address)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(liquiditymanager.Rebalancer)
		}
	}

	if rf, ok := ret.Get(1).(func(models.NetworkSelector, models.Address) error); ok {
		r1 = rf(networkID, address)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// NewFactory creates a new instance of Factory. It also registers a testing interface on the mock and a cleanup function to assert the mocks expectations.
// The first argument is typically a *testing.T value.
func NewFactory(t interface {
	mock.TestingT
	Cleanup(func())
}) *Factory {
	mock := &Factory{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}