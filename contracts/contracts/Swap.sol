// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract Swapify {
    struct Swap {
        Status status;
        address seller;
        address buyer;
        address[] swapTokens;
        uint256[] swapTokenIds;
        uint256 swapId;
        uint256 price;
    }
    uint256 public swapCount;
    mapping(uint256 => Swap) public swaps;
    mapping(address => uint256[]) public userSwaps; 

    address USDCToken = address(0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d);

    event SwapCreated(uint256 swapId);
    event SwapRejected(uint256 swapId);
    event SwapAccepted(uint256 swapId);

    enum Status {
        CREATED,
        REJECTED,
        ACCEPTED
    }

    modifier onlySeller(uint256 _swapId) {
        require(swaps[_swapId].seller == msg.sender, "Only Seller Allowed");
        _;
    }

    modifier onlyBuyer(uint256 _swapId) {
        require(
            swaps[_swapId].buyer == msg.sender,
            "Only Buyer Allowed"
        );
        _;
    }

    /**
     * @dev Initialize the contract settings, and owner to the deployer.
     */
    constructor() {}

    function createSwap(
        address[] memory _swapTokens,
        uint256[] memory _swapTokenIds,
        address _buyer,
        uint256 price
    ) public {
        require(_swapTokens.length == _swapTokenIds.length, "!length");

        // create swap
        uint256 swapId = swapCount;
        Swap memory swap_ = Swap(
            Status.CREATED,
            msg.sender,
            _buyer,
            _swapTokens,
            _swapTokenIds,
            swapId,
            price
        );

        // this is avoid if we follow the tokenId strategy without needing to stake the NFT
        for (uint256 i = 0; i < _swapTokens.length; i++) {
            IERC721(_swapTokens[i]).safeTransferFrom(
                msg.sender,
                address(this),
                _swapTokenIds[i]
            );
        }

        swaps[swapId] = swap_;
        userSwaps[msg.sender].push(swapId);
        swapCount++;

        emit SwapCreated(swapId);
    }

    function acceptOffer(uint256 _swapId)
        public
        onlyBuyer(_swapId)
    {
        require(
            swaps[_swapId].status == Status.CREATED,
            "Can't Accept now"
        );

        address seller = swaps[_swapId].seller;
        address[] memory swapTokens = swaps[_swapId].swapTokens;
        uint256[] memory swapTokenIds = swaps[_swapId].swapTokenIds;
        for (uint256 i = 0; i < swapTokens.length; i++) {
            IERC721(swapTokens[i]).safeTransferFrom(
                seller,
                msg.sender,
                swapTokenIds[i]
            );
        }

        IERC20(USDCToken).transferFrom(msg.sender, seller, swaps[_swapId].price);

        swaps[_swapId].status = Status.ACCEPTED;

        emit SwapAccepted( _swapId);
    }

    function rejectOffer(uint256 _swapId)
        public
        onlyBuyer(_swapId)
    {
        require(
            swaps[_swapId].status == Status.CREATED,
            "Can't Accept now"
        );

        swaps[_swapId].status = Status.REJECTED;

        emit SwapRejected( _swapId);
    }
}