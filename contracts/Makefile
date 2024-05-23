# Load environment variables from .env file
ifneq (,$(wildcard .env))
    include .env
    export
endif

# Target for Avalanche Fuji
deploy_avalanche_fuji:
	@forge script script/DeployDeposit.s.sol:DeployDeposit --rpc-url $(AVALANCHE_FUJI_RPC_URL) --account $(ACCOUNT) --sender $(OWNER_ADDRESS) --broadcast

# Target for Ethereum Sepolia
deploy_ethereum_sepolia:
	@forge script script/DeployDeposit.s.sol:DeployDeposit --rpc-url $(ETHEREUM_SEPOLIA_RPC_URL) --account $(ACCOUNT) --sender $(OWNER_ADDRESS) --broadcast

# Target for Arbitrum Sepolia
deploy_arbitrum_sepolia:
	@forge script script/DeployDeposit.s.sol:DeployDeposit --rpc-url $(ARBITRUM_SEPOLIA_RPC_URL) --account $(ACCOUNT) --sender $(OWNER_ADDRESS) --broadcast

# Target for Polygon Amoy
deploy_polygon_amoy:
	@forge script script/DeployDeposit.s.sol:DeployDeposit --rpc-url $(POLYGON_AMOY_RPC_URL) --account $(ACCOUNT) --sender $(OWNER_ADDRESS) --broadcast

# Target for Optimism Sepolia
deploy_optimism_sepolia:
	@forge script script/DeployDeposit.s.sol:DeployDeposit --rpc-url $(OPTIMISM_SEPOLIA_RPC_URL) --account $(ACCOUNT) --sender $(OWNER_ADDRESS) --broadcast

# Target for Base Sepolia
deploy_base_sepolia:
	@forge script script/DeployDeposit.s.sol:DeployDeposit --rpc-url $(BASE_SEPOLIA_RPC_URL) --account $(ACCOUNT) --sender $(OWNER_ADDRESS) --broadcast

# Target to deploy to all chains
deploy_all: deploy_avalanche_fuji deploy_ethereum_sepolia deploy_arbitrum_sepolia deploy_polygon_amoy deploy_optimism_sepolia deploy_base_sepolia

.PHONY: deploy_avalanche_fuji deploy_ethereum_sepolia deploy_arbitrum_sepolia deploy_polygon_amoy deploy_optimism_sepolia deploy_base_sepolia deploy_all
