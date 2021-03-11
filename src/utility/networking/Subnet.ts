/**
 * Subnet wrapper class with protected member and basic checking/processing.
 */
export class Subnet{

    constructor(private address: number, private mask: number, private wildcard: number){}

    /**
     * Return the network address.
     */
    public getAddress(): number{
        return this.address;
    }

    /**
     * Return the network mask.
     */
    public getMask(): number{
        return this.mask;
    }

    /**
     * Return the wildcard or host mask.
     */
    public getWildcard(): number{
        return this.wildcard;
    }

    /**
     * Return first address in subnet
     */
    public getLowerBound(): number{
        return this.address;
    }

    /**
     * Return last address in subnet
     */
    public getUpperBound(): number{
        return this.address ^ this.wildcard;
    }

    /**
     * Return the amount of bits used for the network.
     */
    public getMaskBits(): number{
        const binary = (this.mask >>> 0).toString(2);
        const matches = binary.match(/1/g) || [];
        return matches.length;
    }

    /**
     * Function to check if the target overlaps with the this subnet's network mask.
     *
     * @param network
     */
    public overlaps(network: Subnet): boolean{
        // Get bits from network address according to this mask.
        const overlappingBits = network.getAddress() & this.mask;

        // Xor between current and network bits should be an exact match.
        return (overlappingBits ^ this.address) <= 0;
    }
}
