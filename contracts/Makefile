# Load environment variables from .env file
ifneq (,$(wildcard .env))
    include .env
    export
endif

deploy_main_router:
	@forge script script/deploy/DeployMainRouter.s.sol:DeployMainRouter --rpc-url $(AVALANCHE_FUJI_RPC_URL) --account $(ACCOUNT) --sender $(OWNER_ADDRESS) --broadcast

# Target for Avalanche Fuji
deploy_depositor:
	@forge script script/deploy/DeployDeposit.s.sol:DeployDeposit --rpc-url $(RPC_URL) --account $(ACCOUNT) --sender $(OWNER_ADDRESS) --broadcast

deploy_minter:
	@forge script script/deploy/DeployMinter.s.sol:DeployMinter --rpc-url $(RPC_URL) --account $(ACCOUNT) --sender $(OWNER_ADDRESS) --broadcast

mint_token:	
	@forge script script/interaction/MintToken.s.sol:MintToken --sig "mintToken(address)" $(USER) --rpc-url $(RPC_URL) --account $(ACCOUNT) --sender $(OWNER_ADDRESS) --broadcast

.PHONY: deploy_avalanche_fuji deploy_ethereum_sepolia deploy_arbitrum_sepolia deploy_polygon_amoy deploy_optimism_sepolia deploy_base_sepolia deploy_all
