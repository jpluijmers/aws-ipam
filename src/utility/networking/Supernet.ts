/**
 * Container class for vending and managing subnets according to a common supernet without collisions.
 */
import {Subnet} from "./Subnet";
import {NetworkBuilder} from "./NetworkBuilder";
import {NetworkPrinter} from "./NetworkPrinter";

export class Supernet {
    private subnets: Subnet[] = [];

    constructor(private supernet: Subnet) {
    }

    /**
     * Find the next available subnet with the specified suffix.
     *
     * @param suffix
     */
    public allocateSubnet(suffix: number): Subnet {
        this.assertIsValidSubnetSuffix(suffix);

        const candidateMask = NetworkBuilder.mask(suffix);
        const networkSize = NetworkBuilder.mask(32) - candidateMask;
        const networkCount = Math.pow(2, (suffix - this.supernet.getMaskBits()));

        for (let c = 0; c <= networkCount - 1; c += 1) {
            const candidate = NetworkBuilder.fromInt(this.supernet.getAddress() + (c * (networkSize + 1)), candidateMask);

            if (!this.isSubnetRegistered(candidate)) {
                this.subnets.push(candidate);
                return candidate;
            }
        }
        throw new Error(`Could not allocate a network of size: ${suffix}, no more hosts for a network of that size`);
    }

    /**
     * Batch import subnets
     *
     * @see registerSubnet
     * @param subnets
     */
    public registerSubnets(subnets: Subnet[]) {
        subnets.forEach(network => this.registerSubnet(network));
    }

    /**
     * Register subnet into the supernet, this will block the range form being allocated.
     *
     * @param subnet
     */
    public registerSubnet(subnet: Subnet) {
        const cidr = NetworkPrinter.formatCidr(subnet);

        if ( !this.supernet.overlaps(subnet) ){
            throw new Error(`Cannot register subnet ${cidr}, its not in range for this supernet.`);
        }

        if (this.isSubnetRegistered(subnet)) {
            throw new Error(`Cannot register subnet ${cidr}, its already registers or overlaps`);
        }

        this.subnets.push(subnet);
    }

    /**
     * Iterate over all subnets to test if the network overlaps.
     *
     * @param networkToTest
     */
    public isSubnetRegistered(networkToTest: Subnet) {
        for (let c = 0; c <= this.subnets.length - 1; c += 1) {
            if (this.subnets[c].overlaps(networkToTest)) return true;
        }
        return false;
    }

    /**
     * Basic checking if the suffix is in a valid range and is higher or equal than the supernet.
     *
     * @param suffix
     */
    public assertIsValidSubnetSuffix(suffix: number) {
        if (suffix > 32) throw new Error(`Suffix ${suffix} is above 32`);
        if (suffix < 0) throw new Error(`Suffix ${suffix} must be 0 or higher`);

        const candidateMask = NetworkBuilder.mask(suffix);
        if (this.supernet.getMask() > candidateMask) {
            throw new Error(`Suffix ${suffix} must be higher than supernet`);
        }
    }
}