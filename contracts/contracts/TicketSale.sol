// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// This is an escrow contract for peer-to-peer resale of NFT event tickets. 
// NFT owners can post a sale with an asking price, and buyers can execute by calling the posted open sale.
// Buyers can post offers, and NFT holders can execute a transfer buy calling an open Offer. 
// An executed sale or offer will alert other open offers to retreive their funds.

contract TicketSale is IERC721Receiver {
    // Sidechain deploys this escrow contract, is the owner, recieves commission on sales.
    address owner;
    // address of the ERC721 event being sold, also gets a taste on sales. 
    address public ticketContract;

    address constant usdBaseCoin = 0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA;

    struct Sale {
        Status status;
        address seller;
        address buyer;
        uint256 ticketId;
        uint256 price;
    }

    struct Offer {
        Status status;
        address seller;
        address buyer;
        uint256 ticketId;
        uint256 price;
    }

    enum Status {
        BLANK,
        OPEN,
        CLOSED,
        CANCELLED
    }

    // NFT ticket sales by NFT ID number. One sale per ID. 
    mapping (uint => Sale) public salesByTicketId;

    // multiple Offers can be posted. The NFT owner can choose an offer to execute a transfer and exchange.
    uint256 public offerCount;
    mapping (uint => Offer[]) public offersByTicketId;


    modifier onlyOwner (address _owner, uint256 _ticketId) {
        require(IERC721(ticketContract).ownerOf(_ticketId) == _owner,
            "You do not own this ticket, sir/madam.");
        _;
    }

    constructor (address _ticketContract) {
        ticketContract = _ticketContract;
        owner = msg.sender;
    }

    function postSale(uint256 _ticketId, uint256 _price) onlyOwner(msg.sender, _ticketId) external {
        IERC721(ticketContract).safeTransferFrom(msg.sender, address(this), _ticketId);
        salesByTicketId[_ticketId] = Sale(
            Status.OPEN,
            msg.sender,
            address(0),
            _ticketId,
            _price
        );

    }

    function postOffer(uint256 _ticketId, uint256 _price) external {
        require(IERC20(usdBaseCoin).balanceOf(msg.sender) >= _price, 
        "insufficient funds, top-off your wallet, bro.");
        // offersByTicketId
    }

    function onERC721Received (
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4){
        return IERC721Receiver.onERC721Received.selector;
    }
}