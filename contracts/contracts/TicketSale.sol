// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

// This is an escrow contract for peer-to-peer resale of NFT event tickets. 
// NFT owners can post a sale with an asking price, and buyers can execute by calling the posted open sale.
// Buyers can post offers, and NFT holders can execute a transfer buy calling an open Offer. 
// An executed sale or offer will alert other open offers to retreive their funds.

contract TicketSale is IERC721Receiver {
    using SafeMath for uint256;

    // Sidechain deploys this escrow contract, is the owner, recieves commission on sales.
    address owner;
    // address of the ERC721 event being sold, also gets a taste on sales. 
    address public ticketContract;

    address constant usdBaseCoin = 0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA;

    struct Sale {
        Status status;
        address seller;
        address buyer;
        uint256[] ticketIds;
        uint256 price;
        uint256 saleId;
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

    uint256 public saleCounter;
    mapping (uint256 => Sale) public allSales;
    mapping (address => uint256[]) userSales;

    // multiple Offers can be posted. The NFT owner can choose an offer to execute a transfer and exchange.
    uint256 public offerCount;
    mapping (uint => Offer[]) public offersByTicketId;


    modifier onlyOwner (address _owner, uint256[] memory _ticketIds) {
        for (uint i=0; i < _ticketIds.length; i++) {
        require(IERC721(ticketContract).ownerOf(_ticketIds[i]) == _owner,
            "You do not own this ticket, sir/madam.");
        }
        _;
    }

    constructor (address _ticketContract) {
        ticketContract = _ticketContract;
        owner = msg.sender;
    }

    function setApproval(address _to, uint256[] memory _tokenIds) public onlyOwner(msg.sender, _tokenIds){
        for (uint i=0; i < _tokenIds.length; i++) {
            IERC721(ticketContract).approve(_to, _tokenIds[i]);
        }
    }

    function postSale(uint256[] memory _ticketIds, uint256 _price, address _buyer) onlyOwner(msg.sender, _ticketIds) external {
        for (uint i=0; i < _ticketIds.length; i++) {
         IERC721(ticketContract).safeTransferFrom(msg.sender, address(this), _ticketIds[i]);
        }
        allSales[saleCounter] = Sale(
            Status.OPEN,
            msg.sender,
            _buyer,
            _ticketIds,
            _price,
            saleCounter
        );
        userSales[msg.sender].push(saleCounter);
        saleCounter++;
    }

    function acceptOffer(uint256 saleId) public {
        require(msg.sender == allSales[saleId].buyer, 'You are not the buyer!!');
         require(
            allSales[saleId].status == Status.OPEN,
            "Can't Accept now"
        );
         require(
            IERC20(usdBaseCoin).balanceOf(msg.sender) > allSales[saleId].price,
            "NO MONEYY"
        );

        Sale memory sale = allSales[saleId];
        IERC20(usdBaseCoin).transferFrom(msg.sender, sale.seller, SafeMath.mul(sale.price,0.9));

        // Royalties
        IERC20(usdBaseCoin).transferFrom(msg.sender, ticketContract, sale.price * 5);
        IERC20(usdBaseCoin).transferFrom(msg.sender, owner, sale.price * 0.05);
        
        for (uint256 i = 0; i < sale.ticketIds.length; i++) {
            IERC721(sale.ticketIds[i]).safeTransferFrom(
                address(this),
                msg.sender, //buyer
                sale.ticketIds[i]
            );
        }

        allSales[saleId].status = Status.CLOSED;
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