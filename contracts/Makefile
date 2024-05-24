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

deposit_token:
	@forge script script/interaction/Deposit.s.sol:Deposit --sig "deposit(address,uint256,uint256)" $(TOKEN) $(AMOUNT) $(ETHER) --rpc-url $(RPC_URL) --account $(ACCOUNT) --sender $(OWNER_ADDRESS) --broadcast

redeem_token:
	@forge script script/interaction/Redeem.s.sol:Redeem -sig "redeem(uint64,address,address,uint256,uint256)" $(CHAIN_SELECTOR) $(DEPOSITOR) $(TOKEN) $(AMOUNT) $(ETHER) --rpc-url $(AVALANCHE_FUJI_RPC_URL) --account $(ACCOUNT) --sender $(OWNER_ADDRESS) --broadcast

mint:
	@forge script script/interaction/Mint.s.sol:Mint --sig  "mint(uint64,address,uint256,uint256)" $(CHAIN_SELECTOR) $(MINTER) $(AMOUNT) $(ETHER) --rpc-url $(AVALANCHE_FUJI_RPC_URL) --account $(ACCOUNT) --sender $(OWNER_ADDRESS) --broadcast

burn:
	@forge script script/interaction/Burn.s.sol:Burn --sig "burn(uint256,uint256)" $(AMOUNT) $(ETHER) --rpc-url $(RPC_URL) --account $(ACCOUNT) --sender $(OWNER_ADDRESS) --broadcast

.PHONY: deploy_avalanche_fuji deploy_ethereum_sepolia deploy_arbitrum_sepolia deploy_polygon_amoy deploy_optimism_sepolia deploy_base_sepolia deploy_all
